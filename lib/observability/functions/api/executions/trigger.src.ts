import { buildCorsOutput, getCurrentUser } from '../../../../common/utils/api';
import { randomUUID } from 'crypto';
import { DalClient } from '../../dal/client';

const main = async (event: AWSLambda.APIGatewayEvent) => {
  const { url, team } = JSON.parse(event.body!);
  const { me } = await getCurrentUser(event);

  const uuid = randomUUID();

  /**
   * Create a new beacon record in the database.
   */
  const mobile = await DalClient.createBeacon(team, 3, uuid, url, 1, me.username, 0, 0);
  const desktop = await DalClient.createBeacon(team, 3, uuid, url, 1, me.username, 1, 0);
  // After creating the record in the database, the Lambda will trigger the graduated ECS task that runs Lighthouse against the specified URL.
  // Then, it will return the UUID of the new execution so the frontend can refresh and update the UI with the new information.

  return buildCorsOutput(event, 200, { mobile, desktop });
};

export { main };
