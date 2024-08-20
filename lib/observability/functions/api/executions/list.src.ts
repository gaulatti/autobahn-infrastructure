import { getCurrentUser, HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ListRenderingParams } from '../../dal/types';

/**
 * Handles the main logic for the API endpoint that lists executions.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const {
    me: { memberships },
  } = await getCurrentUser(event);

  const renderingParams: ListRenderingParams = (event.queryStringParameters as unknown as ListRenderingParams) || {};

  const teams = memberships.map(({ team: { id } }: { team: { id: number } }) => id);
  const teamPulses = await DalClient.listPulsesByTeam(teams, renderingParams);
  const output = { pulses: teamPulses };

  return output;
});

export { main };
