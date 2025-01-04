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
const main = async (event: any): Promise<void> => {
  console.log(JSON.stringify(event))
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

  /**
   * Sends a message to a Slack channel using Axios.
   */
  const message = {
    text: 'Hello from Lambda using Axios! 🎉',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Hello from Lambda!* 🎉',
        },
      },
    ],
  };

  try {
    const response = await axios.post(slackUrl!, message, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Message sent to Slack:', response.data);
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
    console.log('Message sent to SNS topic', data);
  } catch (err) {
    console.error('Error sending message to SNS topic', err);
  }
};

export { main };
