import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

const s3Client = new S3Client({ region: 'us-east-1' });
const streamToString = async (stream: Readable): Promise<string> => {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(new TextDecoder('utf-8').decode(Buffer.concat(chunks))));
    stream.on('error', reject);
  });
};

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

    console.log(`Reading file from bucket: ${bucketName}, key: ${objectKey}`);

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      const response = await s3Client.send(command);
      const bodyContents = await streamToString(response.Body as Readable);
      const lighthouseReport = JSON.parse(bodyContents);

      // TODO: Read the file and post the metrics to CW
    } catch (error) {
      console.error('Error reading file from S3:', error);
    }
  }
};

export { main };
