import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SNSEventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import { streamToString } from '../../../common/utils/s3';
import { DalClient } from '../dal/client';
import { isWarmup } from '../../../common/utils';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
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

    if (objectKey.includes('.json')) {
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
         * Update the record with the new metrics.
         */
        await DalClient.updateHeartbeat(
          currentHeartbeat.id,
          4,
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
