import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

/**
 * Main Lambda function for the Lighthouse Provider.
 */
const snsClient = new SNSClient();

/**
 * Main function to handle the event.
 *
 * @param event - The event object containing the URL and membership ID.
 * @param event.url - The URL to be processed.
 * @param event.membership_id - The membership ID associated with the event.
 *
 * Logs the event details and sends a message to an SNS topic with the event data and a strategy.
 *
 * @returns A promise that resolves when the SNS message is sent.
 */
const main = async (event: { url: string; membership_id: number, isBeta: boolean }) => {
  const { url, membership_id, isBeta } = event;

  const params = {
    Message: JSON.stringify({ url, membership_id, strategy: 4, isBeta }),
    TopicArn: process.env.START_PLAYLIST_TOPIC_ARN,
  };

  await snsClient.send(new PublishCommand(params));
};

export { main };
