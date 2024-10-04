import { getCurrentSubFromEvent, getCurrentUserBySub, HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ListRenderingParams } from '../../dal/types';

/**
 * Handles the main logic for the API endpoint that lists executions.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const teams: number[] = [];

  /**
   * If the team query parameter is provided, use it to filter the pulses.
   */
  if (event.queryStringParameters?.team) {
    teams.push(parseInt(event.queryStringParameters.team));
  } else {
    /**
     * If the team query parameter is not provided, get the teams the user is a member of.
     */

    const sub = getCurrentSubFromEvent(event);
    const {
      me: { memberships },
    } = await getCurrentUserBySub(sub);
    memberships.forEach(({ team: { id } }: { team: { id: number } }) => teams.push(id));
  }

  const renderingParams: ListRenderingParams = event.queryStringParameters?.startRow
    ? (event.queryStringParameters as unknown as ListRenderingParams)
    : {
        startRow: '0',
        endRow: '100',
        sort: '',
        filters: '{}',
      };

  const teamProjects = await DalClient.listProjectsByTeam(teams, renderingParams);
  const output = { projects: teamProjects };

  return output;
});

export { main };