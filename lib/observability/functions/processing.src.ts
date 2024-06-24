import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CloudWatchClient, MetricDatum, PutMetricDataCommand, PutMetricDataCommandInput, StandardUnit } from '@aws-sdk/client-cloudwatch';
import { SNSEventRecord } from 'aws-lambda';
import { Readable } from 'stream';

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

const isMobileUserAgent = (userAgent: string) => {
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent);
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

      const { environment, audits } = lighthouseReport;
      const isMobile = isMobileUserAgent(environment.networkUserAgent);
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

      /**
       * Post metrics to CloudWatch
       */
      const MetricData: MetricDatum[] = monitoredMetrics.map((monitoredMetric) => {
        const metric = metrics[monitoredMetric];

        return {
          MetricName: monitoredMetric,
          Dimensions: [
            {
              Name: 'Stage',
              Value: 'prod',
            },
          ],
          Unit: metric.numericUnit === 'millisecond' ? StandardUnit.Milliseconds : StandardUnit.None,
          Value: metric.numericValue,
        };
      });

      /**
       * Add the total score as a metric.
       */
      const cloudWatchInput: PutMetricDataCommandInput = {
        MetricData,
        Namespace: 'DressYouUp',
      };

      try {
        const command = new PutMetricDataCommand(cloudWatchInput);
        const cloudWatchResponse = await cloudwatchClient.send(command);
        console.log('Successfully sent metrics to CloudWatch:', cloudWatchResponse);
      } catch (error) {
        console.error('Error sending metrics to CloudWatch:', error);
      }
    } catch (error) {
      console.error('Error reading file from S3:', error);
    }
  }
};

export { main };
