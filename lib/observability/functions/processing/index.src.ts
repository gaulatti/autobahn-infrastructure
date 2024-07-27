import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SNSEventRecord } from 'aws-lambda';
import { Readable } from 'stream';
import { streamToString } from '../../../common/utils/s3';
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

const s3Client = new S3Client();

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
        const uuidRecords: any[] = await DalClient.getBeaconByUUID(uuid);
        const currentRecord = uuidRecords.find((record: any) => record.mode === (isMobile ? 0 : 1));

        const { firstContentfulPaint, largestContentfulPaint, interactive, speedIndex, cumulativeLayoutShift, timeToFirstByte, observedDomContentLoaded } =
          metrics.find(() => true);

        const thumbnails: { timestamp: number }[] = [];
        screenshots.push(finalScreenshot)
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
        await DalClient.updateBeacon(
          currentRecord.id,
          2,
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
      } catch (error) {
        console.error('Error processing execution:', error);
      }
    }
  }
};

export { main };
