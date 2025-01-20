import { GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Readable } from 'stream';
import { extractLighthouseSummary } from '../../../../utils/plugins';
import { streamToString } from '../../../../utils/s3';

/**
 * PageSpeed Insights categories.
 */
const categories = ['performance', 'seo', 'accessibility', 'best-practices'];

/**
 * PageSpeed Insights strategies.
 */
const strategies = ['mobile', 'desktop'];

/**
 * Main Lambda function for the Lighthouse Provider.
 */
const snsClient = new SNSClient();

/**
 * Represents the Secrets Manager client.
 */
const secretsManagerClient = new SecretsManagerClient();

/**
 * Represents the S3 client.
 */
const s3Client = new S3Client();

/**
 * Deeply merges the properties of the source object into the target object.
 * If a property in the source object is an object itself, the function will
 * recursively merge its properties into the corresponding object in the target.
 *
 * @template T - The type of the target object.
 * @param {T} target - The target object to which properties will be merged.
 * @param {Partial<T>} source - The source object containing properties to merge.
 * @returns {T} - The target object with merged properties.
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  for (const key of Object.keys(source) as (keyof T)[]) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) {
        (target[key] as any) = {};
      }
      deepMerge(target[key] as any, source[key] as any);
    } else {
      target[key] = source[key] as T[keyof T];
    }
  }
  return target;
}

/**
 * Merges the contents of multiple JSON files into a single object.
 *
 * @param files - An array of strings, where each string is the content of a JSON file.
 * @returns A single object containing the merged contents of all the JSON files.
 *
 * @throws Will log an error message if any file content cannot be parsed as JSON.
 */
function mergeOutputFiles(files: string[]): Record<string, any> {
  let mergedData: Record<string, any> = {};

  files.forEach((file) => {
    try {
      mergedData = deepMerge(mergedData, JSON.parse(file));
    } catch (error) {
      console.error(`Error reading or parsing file`, error);
    }
  });

  return mergedData;
}

/**
 * Main function to handle the event and process the playlist.
 *
 * @param {any} event - The event object containing the playlist information.
 * @returns {Promise<void>} - A promise that resolves when the function completes.
 *
 * The function performs the following tasks:
 * 1. Extracts necessary parameters from the event and playlist.
 * 2. Retrieves a secret value from AWS Secrets Manager.
 * 3. Checks if an action is present and handles existing files in S3.
 * 4. If the status is 'FAILED' and retries exceed 5, publishes a failure message to an SNS topic.
 * 5. If the status is 'FAILED' and retries are within limit, retries the process by publishing a message to an SNS topic.
 * 6. Triggers PageSpeed Insights Workers for each category and strategy combination by publishing messages to an SNS topic.
 *
 * @throws {Error} - Throws an error if there is an issue triggering the PageSpeed Insights Worker.
 */
const main = async (event: any): Promise<void> => {
  const { playlist } = event;

  /**
   * Provider Params
   */
  const {
    id,
    strategy,
    retries,
    status,
    action,
    manifest: {
      context: { url },
    },
    outputFile,
  } = playlist;

  /**
   * Get the secret value from Secrets Manager.
   */
  const { SecretString } = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.KEY_ARN,
    })
  );

  if (!!action) {
    const expectedFiles = categories.map((cat) => `${id}.${cat}.${strategy}.json`);

    try {
      const listResponse = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: process.env.BUCKET_NAME,
          Prefix: `${id}.`,
        })
      );
      const existingFiles = listResponse.Contents?.map((obj) => obj.Key) || [];

      /**
       * Check if all expected files exist.
       */
      const missingFiles = expectedFiles.filter((file) => !existingFiles.includes(file));
      if (missingFiles.length > 0) {
        console.warn('Missing files, skipping process:', missingFiles);
        return;
      }

      /**
       * Get the contents of the files.
       */
      const fileContents = await Promise.all(
        expectedFiles.map(async (file) => {
          const response = await s3Client.send(
            new GetObjectCommand({
              Bucket: process.env.BUCKET_NAME,
              Key: file,
            })
          );
          return await streamToString(response.Body as Readable);
        })
      );

      /**
       * Merge the contents of the files.
       */
      const mergedContent = mergeOutputFiles(fileContents);
      const mergedString = JSON.stringify(mergedContent);
      /**
       * Upload the merged file to S3.
       */
      const mergedFileKey = `${id}.${strategy}.json`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.BUCKET_NAME,
          Key: mergedFileKey,
          Body: mergedString,
          ContentType: 'application/json',
        })
      );

      /**
       * Extract the Lighthouse summary from the body contents.
       */
      const output = extractLighthouseSummary(mergedString, strategy);
      /**
       * Publish the message to the SNS topic.
       */
      try {
        const params = {
          Message: JSON.stringify({ output, id, key: SecretString }),
          TopicArn: process.env.UPDATE_PLAYLIST_TOPIC_ARN,
        };

        await snsClient.send(new PublishCommand(params));
        return;
      } catch (err) {
        console.error('Error sending message to SNS topic', err);
      }
    } catch (error) {
      console.error('Error listing objects', error);
    }
  }

  if (status === 'FAILED') {
    if (retries > 5) {
      try {
        const params = {
          Message: JSON.stringify({ failed: true, id, key: SecretString }),
          TopicArn: process.env.UPDATE_PLAYLIST_TOPIC_ARN,
        };

        await snsClient.send(new PublishCommand(params));
        return;
      } catch (err) {
        console.error('Error sending message to SNS topic', err);
      }
    }

    try {
      /**
       * Run the Workers
       */
      const params = {
        Message: JSON.stringify(playlist),
        TopicArn: process.env.TRIGGER_TOPIC_ARN,
      };

      await snsClient.send(new PublishCommand(params));
    } catch (error) {
      throw new Error(`Error triggering PageSpeed Insights Worker (${error})`);
    }
  }

  /**
   * Trigger the PageSpeed Insights Workers.
   */
  try {
    for (const currentCategory of categories) {
      for (const currentStrategy of strategies) {
        const params = {
          Message: JSON.stringify({ ...playlist, category: currentCategory, strategy: currentStrategy }),
          TopicArn: process.env.TRIGGER_TOPIC_ARN,
        };

        try {
          const data = await snsClient.send(new PublishCommand(params));
        } catch (error) {
          console.error('Error publishing message:', error);
        }
      }
    }
  } catch (error) {
    throw new Error(`Error triggering PageSpeed Insights Worker (${error})`);
  }
};

export { main };
