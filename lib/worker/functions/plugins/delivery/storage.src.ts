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
   * List of plugin ARNs to check.
   */
  const plugins = [
    `arn:aws:lambda:us-east-1:${process.env.AWS_ACCOUNT_ID}:function:AutobahnInternalLighthouseProviderPlugin`,
    `arn:aws:lambda:us-east-1:${process.env.AWS_ACCOUNT_ID}:function:AutobahnPageSpeedInsightsProviderPlugin`,
  ];

  /**
   * Iterate over each plugin ARN and check conditions.
   */
  for (const plugin of plugins) {
    const pluginOutput: { simplifiedResult: { mode: string } }[] = output[plugin];

    if (!pluginOutput) {
      console.warn(`Output for plugin ${plugin} not found`);
      continue;
    }

    /**
     * Check if the plugin output has both desktop and mobile modes.
     */
    const hasDesktop = pluginOutput.find((item) => item.simplifiedResult.mode === 'desktop');
    const hasMobile = pluginOutput.find((item) => item.simplifiedResult.mode === 'mobile');

    if (hasDesktop && hasMobile) {
      allowedOutputs.push(plugin);
    }
  }

  if (allowedOutputs.length === 0) {
    console.error('No valid outputs found');
    return;
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
    await snsClient.send(new PublishCommand(params));
  } catch (err) {
    console.error('Error sending message to SNS topic', err);
  }
};

export { main };
