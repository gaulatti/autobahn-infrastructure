import { buildCorsOutput, getCurrentUser } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';

/**
 * Handles the main logic for the API endpoint that lists executions.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = async (event: AWSLambda.APIGatewayEvent) => {
  const {
    me: { id, memberships },
  } = await getCurrentUser(event);

  const teams = memberships.map(({ team: { id } }: { team: { id: number } }) => id);

  const teamBeacons = await DalClient.listBeaconsByTeam(teams);
  const userBeacons = await DalClient.listBeaconsByUser(id);
  const output = [...teamBeacons, ...userBeacons];

  return buildCorsOutput(event, 200, output);
};

export { main };
