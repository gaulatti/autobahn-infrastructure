import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { SNSEventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import { isWarmup } from '../../../common/utils';
import { streamToString } from '../../../common/utils/s3';
import { DalClient } from '../dal/client';

interface LighthouseResult {
  categories: {
    performance: any;
    accessibility: any;
    'best-practices': any;
    seo: any;
  };
  audits: { [key: string]: any };
  configSettings: {
    emulatedFormFactor: string;
    locale: string;
  };
  timing: {
    total: number;
  };
  finalUrl: string;
  requestedUrl: string;
}

interface SimplifiedLHResult {
  url: string;
  finalUrl: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  timings: {
    FCP: number;
    LCP: number;
    CLS: number;
    TBT: number;
    TTI: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savings: string;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    details: any;
  }>;
  resourceSummary: {
    totalRequests: number;
    totalTransferSize: number;
    breakdown: { [key: string]: { size: number; count: number } };
  };
}

/**
 * Extracts a simplified summary from a raw Lighthouse report.
 *
 * @param rawData - The raw data of the Lighthouse report.
 * @returns The simplified summary of the Lighthouse report.
 */
const extractLighthouseSummary = (rawData: string) => {
  const lhReport: LighthouseResult = JSON.parse(rawData);

  const simplifiedResult: SimplifiedLHResult = {
    url: lhReport.requestedUrl,
    finalUrl: lhReport.finalUrl,
    performance: lhReport.categories.performance.score * 100,
    accessibility: lhReport.categories.accessibility.score * 100,
    bestPractices: lhReport.categories['best-practices'].score * 100,
    seo: lhReport.categories.seo.score * 100,
    timings: {
      FCP: lhReport.audits['first-contentful-paint'].numericValue,
      LCP: lhReport.audits['largest-contentful-paint'].numericValue,
      CLS: lhReport.audits['cumulative-layout-shift'].numericValue,
      TBT: lhReport.audits['total-blocking-time'].numericValue,
      TTI: lhReport.audits['interactive'].numericValue,
    },
    opportunities: Object.keys(lhReport.audits)
      .filter((key) => lhReport.audits[key].details?.type === 'opportunity')
      .map((key) => ({
        id: key,
        title: lhReport.audits[key].title,
        description: lhReport.audits[key].description,
        savings: lhReport.audits[key].details.overallSavingsMs + 'ms',
      })),
    diagnostics: Object.keys(lhReport.audits)
      .filter((key) => lhReport.audits[key].details?.type === 'diagnostic')
      .map((key) => ({
        id: key,
        title: lhReport.audits[key].title,
        description: lhReport.audits[key].description,
        details: lhReport.audits[key].details,
      })),
    resourceSummary: {
      totalRequests: lhReport.audits['resource-summary'].details.items.length,
      totalTransferSize: lhReport.audits['resource-summary'].details.items.reduce((acc: number, item: any) => acc + item.transferSize, 0),
      breakdown: lhReport.audits['resource-summary'].details.items.reduce((acc: any, item: any) => {
        acc[item.resourceType] = acc[item.resourceType] || { size: 0, count: 0 };
        acc[item.resourceType].size += item.transferSize;
        acc[item.resourceType].count += 1;
        return acc;
      }, {}),
    },
  };

  return { simplifiedResult };
};

/**
 * AWS does not maintain types, so we need to figure out on our own.
 */
interface S3Event {
  Records: SNSEventRecord[] &
    {
      s3: {
        s3SchemaVersion: string;
        configurationId: string;
        bucket: {
          name: string;
          ownerIdentity: {
            principalId: string;
          };
          arn: string;
        };
        object: {
          key: string;
          size: number;
          eTag: string;
          sequencer: string;
        };
      };
    }[];
}

/**
 * The S3 client.
 */
const s3Client = new S3Client();

/**
 * The DynamoDB client.
 */
const client = new DynamoDBClient();

/**
 * The API Gateway Management API client.
 */
let apiGatewayManagementApiClient: ApiGatewayManagementApiClient;

/**
 * The main function that processes the event.
 *
 * @param event - The event object.
 */
const main = async (event: S3Event) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  /**
   * Create a new API Gateway Management API client.
   */
  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: `https://${process.env.WEBSOCKET_API_FQDN}/prod`,
    });
  }

  const { Records } = event;
  for (const record of Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    if (objectKey.includes('.json') && !objectKey.includes('.min.json')) {
      console.log(`Processing object: ${objectKey}`);
      /**
       * Get the object from S3.
       */
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      try {
        const response = await s3Client.send(command);
        const bodyContents = await streamToString(response.Body as Readable);
        const lighthouseReport = JSON.parse(bodyContents);

        const {
          audits: {
            metrics: {
              details: { items: metrics },
            },
            'screenshot-thumbnails': {
              details: { items: screenshots },
            },
            'final-screenshot': { details: finalScreenshot },
          },
          categories: {
            performance: { score: performanceScore },
            accessibility: { score: accessibilityScore },
            'best-practices': { score: bestPracticesScore },
            seo: { score: seoScore },
          },
        } = lighthouseReport;

        const [uuid, mode] = objectKey.split('.');
        const isMobile = mode === 'mobile';
        const pulse = await DalClient.getPulseByUUID(uuid);
        const currentHeartbeat = pulse.heartbeats.find((record: any) => record.mode === (isMobile ? 0 : 1));

        const { firstContentfulPaint, largestContentfulPaint, interactive, speedIndex, cumulativeLayoutShift, timeToFirstByte, observedDomContentLoaded } =
          metrics.find(() => true);

        const thumbnails: { timestamp: number }[] = [];
        screenshots.push(finalScreenshot);
        for (const thumbnail in screenshots) {
          try {
            thumbnails.push({
              timestamp: screenshots[thumbnail].timing,
            });

            const imageData = screenshots[thumbnail].data.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(imageData, 'base64');
            const uploadParams = {
              Bucket: bucketName,
              Key: `screenshots/${uuid}.${mode}.${thumbnail}.jpg`,
              Body: imageBuffer,
              ContentEncoding: 'base64',
              ContentType: 'image/jpeg',
            };

            await s3Client.send(new PutObjectCommand(uploadParams));
          } catch (e) {
            throw new Error(`Error uploading screenshot: ${e}, ${JSON.stringify(screenshots[thumbnail])}`);
          }
        }

        /**
         * Extract the summary from the Lighthouse report and upload it to s3.
         */
        const { simplifiedResult } = extractLighthouseSummary(bodyContents);
        const uploadParams = {
          Bucket: bucketName,
          Key: `${uuid}.${mode}.min.json`,
          Body: JSON.stringify(simplifiedResult, null, 2),
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        /**
         * Update the record with the new metrics.
         */
        await DalClient.updateHeartbeat(
          currentHeartbeat.id,
          timeToFirstByte,
          firstContentfulPaint,
          observedDomContentLoaded,
          largestContentfulPaint,
          interactive,
          speedIndex,
          cumulativeLayoutShift,
          performanceScore * 100,
          accessibilityScore * 100,
          bestPracticesScore * 100,
          seoScore * 100,
          4,
          thumbnails
        );

        /**
         * Broadcast the new metrics to all connections.
         */
        const teamParams = {
          TableName: process.env.CACHE_TABLE_NAME,
          Key: marshall({
            sub: pulse.teams_id.toString(),
            type: 'teamConnections',
          }),
        };

        const getTeamCommand = new GetItemCommand(teamParams);
        const getTeamResponse = await client.send(getTeamCommand);
        const teamRecord = unmarshall(getTeamResponse.Item!);

        const connections = teamRecord.connections || [];
        for (const connection of connections) {
          try {
            const params = {
              ConnectionId: connection,
              Data: Buffer.from(JSON.stringify({ action: 'REFRESH_EXECUTIONS_TABLE' })),
            };
            await apiGatewayManagementApiClient.send(new PostToConnectionCommand(params));
            console.log(`Sent message to connection ${connection}`);
          } catch (error) {
            console.error(`Failed to send message to connection ${connection}`, error);
          }
        }
      } catch (error) {
        console.error('Error processing execution:', error);
      }
    }
  }
};

export { main };
