import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

const main = async (event: any): Promise<void> => {
  const { playlist } = event;

  /**
   * Provider Params
   */
  const {
    id,
    category,
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
    console.log('Segue action detected, skipping new worker');
    /**
     * Get the object from S3.
     */
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: outputFile,
      })
    );

    const bodyContents = await streamToString(response.Body as Readable);

    /**
     * Extract the Lighthouse summary from the body contents.
     */
    const output = extractLighthouseSummary(bodyContents, strategy);

    /**
     * Publish the message to the SNS topic.
     */
    try {
      const params = {
        Message: JSON.stringify({ output, id, key: SecretString }),
        TopicArn: process.env.UPDATE_PLAYLIST_TOPIC_ARN,
      };

      const data = await snsClient.send(new PublishCommand(params));
      return;
    } catch (err) {
      console.error('Error sending message to SNS topic', err);
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

    console.log('Retrying', JSON.stringify({ retries, url }));
    try {
      /**
       * Run the Workers
       */
      const params = {
        Message: JSON.stringify({ url, id, category, strategy, retries }),
        TopicArn: process.env.TRIGGER_TOPIC_ARN,
      };

      const data = await snsClient.send(new PublishCommand(params));
      console.log({ data });
    } catch (error) {
      throw new Error(`Error triggering PageSpeed Insights Worker (${error})`);
    }
  }

  /**
   * Trigger the PageSpeed Insights Workers.
   */
  try {
    for (const category of categories) {
      for (const strategy of strategies) {
        const params = {
          Message: JSON.stringify({ url, id, category, strategy, retries }),
          TopicArn: process.env.TRIGGER_TOPIC_ARN,
        };

        try {
          const data = await snsClient.send(new PublishCommand(params));
          console.log({ data });
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
