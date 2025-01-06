import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import axios from 'axios';

/**
 * Main Lambda function for the Autobahn Storage.
 */
const snsClient = new SNSClient();

/**
 * Represents the Secrets Manager client.
 */
const secretsManagerClient = new SecretsManagerClient();

/**
 * Main function to handle the event.
 *
 * This function performs the following tasks:
 * 1. Retrieves secret values from AWS Secrets Manager.
 * 2. Sends a message to a Slack channel using Axios.
 * 3. Publishes a message to an SNS topic.
 *
 * @param event - The event object containing necessary data.
 * @returns A promise that resolves to void.
 */
const main = async (event: { playlist: { id: number; slug: string; manifest: { fqdn: string; context: { url: string } } } }): Promise<void> => {
  /**
   * Retrieves the secret values from AWS Secrets Manager.
   */
  const { SecretString: key } = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.KEY_ARN,
    })
  );
  const { SecretString: slackUrl } = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.SLACK_URL_ARN,
    })
  );

  const {
    playlist: {
      slug,
      manifest: {
        fqdn,
        context: { url },
      },
    },
  } = event;

  /**
   * Sends a message to a Slack channel using Axios.
   */
  const message = {
    text: `Playlist completed! 🎉\nThe playlist for ${url} has been completed.`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Playlist Completed!* 🎉\nThe playlist for *<${url}|${url}>* has been successfully completed.`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*View Details:* <https://${fqdn}/assessments/playlists/${slug}|Click here to view the playlist details>`,
        },
      },
    ],
  };

  try {
    const response = await axios.post(slackUrl!, message, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    console.error('Error sending message to Slack');
  }

  /**
   * Publishes a message to an SNS topic.
   */
  const params = {
    Message: JSON.stringify({ output: [], id: event.playlist.id, key }),
    TopicArn: process.env.UPDATE_PLAYLIST_TOPIC_ARN,
  };

  try {
    const data = await snsClient.send(new PublishCommand(params));
  } catch (err) {
    console.error('Error sending message to SNS topic', err);
  }
};

export { main };
