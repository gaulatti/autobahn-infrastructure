import { isWarmup } from '../../../../common/utils';
import { buildCorsOutput, getCurrentUser } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ListRenderingParams } from '../../dal/types';

function LogExecutionTime<T extends (...args: any[]) => Promise<any>>(fn: T): T {
  return async function (...args: Parameters<T>): Promise<ReturnType<T>> {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    console.log(`Execution time: ${end - start}ms`);
    return result;
  } as T;
}

/**
 * Handles the main logic for the API endpoint that lists executions.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = LogExecutionTime(async (event: AWSLambda.APIGatewayEvent) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  const {
    me: { memberships },
  } = await getCurrentUser(event);

  const { startRow, endRow, sort, filters }: ListRenderingParams = (event.queryStringParameters as unknown as ListRenderingParams) || {};

  const teams = memberships.map(({ team: { id } }: { team: { id: number } }) => id);
  const teamBeacons = await DalClient.listBeaconsByTeam(teams, { startRow, endRow, sort, filters });
  const output = { beacons: teamBeacons };

  return buildCorsOutput(event, 200, output);
});

export { main };
