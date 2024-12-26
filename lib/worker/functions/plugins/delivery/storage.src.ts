import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

/**
 * Main Lambda function for the Autobahn Storage.
 */
const snsClient = new SNSClient();

/**
 * Represents the Secrets Manager client.
 */
const secretsManagerClient = new SecretsManagerClient();

/**
 * Main handler function for the Autobahn Storage Lambda.
 *
 * @param event - The event object passed to the Lambda function.
 *
 * This function logs a greeting message along with the event and a custom message.
 * It then constructs a message payload and publishes it to an SNS topic specified by the
 * `UPDATE_PLAYLIST_TOPIC_ARN` environment variable.
 *
 * @returns {Promise<void>} - A promise that resolves when the message is successfully sent to the SNS topic.
 *
 * @throws {Error} - If there is an error sending the message to the SNS topic, it logs the error.
 */
const main = async (event: any): Promise<void> => {
  /**
   * Represents the allowed outputs.
   */
  const allowedOutputs: string[] = [];

  /**
   * Destructure the event object to get the output.
   */
  const {
    playlist: {
      manifest: {
        context: { output },
      },
    },
  } = event;

  /**
   * Validate the internal Lighthouse output.
   */
  const internalLighthouseOutput: { simplifiedResult: { mode: string } }[] =
    output[`arn:aws:lambda:us-east-1:${process.env.AWS_ACCOUNT_ID}:function:AutobahnInternalLighthouseProviderPlugin`];

  if (!internalLighthouseOutput) {
    console.error('Internal Lighthouse output not found');
    return;
  }

  /**
   * Check if the internal Lighthouse output has both desktop and mobile modes.
   */
  const hasDesktop = internalLighthouseOutput.find((item) => {
    return item.simplifiedResult.mode === 'desktop';
  });
  const hasMobile = internalLighthouseOutput.find((item) => {
    return item.simplifiedResult.mode === 'mobile';
  });

  /**
   * Add the internal Lighthouse output to the allowed outputs if it has both desktop and mobile modes.
   */
  if (hasDesktop && hasMobile) {
    allowedOutputs.push(`arn:aws:lambda:us-east-1:${process.env.AWS_ACCOUNT_ID}:function:AutobahnInternalLighthouseProviderPlugin`);
  }

  /**
   * Get the secret value from Secrets Manager.
   */
  const { SecretString } = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.KEY_ARN,
    })
  );

  const params = {
    Message: JSON.stringify({ output: allowedOutputs, id: event.playlist.id, key: SecretString }),
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
