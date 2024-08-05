import { buildCorsOutput, getCurrentUser } from '../../../../common/utils/api';
import { randomUUID } from 'crypto';
import { DalClient } from '../../dal/client';
import { SNSClient } from '@aws-sdk/client-sns';
import { PublishCommand } from '@aws-sdk/client-sns';
import { isWarmup } from '../../../../common/utils';

const snsClient = new SNSClient();

const main = async (event: AWSLambda.APIGatewayEvent) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  const { url, team } = JSON.parse(event.body!);
  const { me } = await getCurrentUser(event);

  /**
   * Generate a new UUID.
   */
  const uuid = randomUUID();

  /**
   * Create a new beacon record for mobile.
   */
  const mobile = await DalClient.createBeacon(team, 3, uuid, url, 1, me.username, 0, 0);
  const mobileCommand = new PublishCommand({
    Message: JSON.stringify({ url, uuid, mode: 'mobile' }),
    TopicArn: process.env.TRIGGER_TOPIC_ARN,
  });
  await snsClient.send(mobileCommand);

  /**
   * Create a new beacon record for desktop.
   */
  const desktop = await DalClient.createBeacon(team, 3, uuid, url, 1, me.username, 1, 0);
  const desktopCommand = new PublishCommand({
    Message: JSON.stringify({ url, uuid, mode: 'desktop' }),
    TopicArn: process.env.TRIGGER_TOPIC_ARN,
  });
  await snsClient.send(desktopCommand);

  /**
   * Return the response.
   */
  return buildCorsOutput(event, 200, { mobile, desktop });
};

export { main };
