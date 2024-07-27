import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CloudWatchClient, MetricDatum, PutMetricDataCommand, PutMetricDataCommandInput, StandardUnit } from '@aws-sdk/client-cloudwatch';
import { SNSEventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import { DalClient } from '../dal/client';

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

const cloudwatchClient = new CloudWatchClient();
const s3Client = new S3Client();

const streamToString = async (stream: Readable): Promise<string> => {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(new TextDecoder('utf-8').decode(Buffer.concat(chunks))));
    stream.on('error', reject);
  });
};

interface ScoreObject {
  score: number;
  scoreDisplayMode: string;
  numericValue: number;
  numericUnit: string;
}

const monitoredMetrics = ['first-contentful-paint', 'largest-contentful-paint', 'interactive', 'speed-index', 'total-blocking-time', 'cumulative-layout-shift'];

/**
 * The main function that processes the event.
 *
 * @param event - The event object.
 */
const main = async (event: S3Event) => {
  const { Records } = event;
  for (const record of Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

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

      const { audits } = lighthouseReport;

      const [uuid, mode] = objectKey.split('.');
      const isMobile = mode === 'mobile';

      let totalScore = 0;

      /**
       * Isolate the metrics we care about.
       */
      const metrics: Record<string, ScoreObject> = {};
      for (const audit in audits) {
        const { score, scoreDisplayMode, numericValue, numericUnit } = audits[audit];

        /**
         * We only care about the score, and we want to ignore the rest, unless it's a metric we want to monitor closely.
         */
        if (score || monitoredMetrics.includes(audit)) {
          metrics[audit] = { score, scoreDisplayMode, numericValue, numericUnit };

          /**
           * This is unweighted score. By now.
           */
          totalScore += score;
        }
      }

      const uuidRecords: any[] = await DalClient.getBeaconByUUID(uuid);
      const currentRecord = uuidRecords.find((record: any) => record.mode === (isMobile ? 0 : 1));

      /**
       * Update the record with the new metrics.
       */
      await DalClient.updateBeacon(
        currentRecord.id,
        2,
        metrics['first-contentful-paint'].numericValue,
        metrics['largest-contentful-paint'].numericValue,
        metrics['interactive'].numericValue,
        metrics['speed-index'].numericValue,
        metrics['cumulative-layout-shift'].numericValue,
        totalScore
      );
    } catch (error) {
      console.error('Error reading file from S3:', error);
    }
  }
};

export { main };
