import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';

/**
 * Main handler function for creating a schedule.
 *
 * @param event - The API Gateway event containing the request data.
 * @returns An object containing the created schedule.
 *
 * @remarks
 * This function handles the creation of a schedule by extracting necessary
 * parameters from the request, fetching the associated project, and then
 * creating the schedule in the database.
 *
 * @example
 * // Example usage:
 * const response = await main(event);
 * console.log(response.schedule);
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  /**
   * Extract the target and cron from the request body.
   */
  const { target, cron } = JSON.parse(event.body!);

  /**
   * Fetch the project.
   */
  const project = await DalClient.getProjectByUUID(uuid!);

  /**
   * Create the schedule.
   */
  const schedule = await DalClient.createSchedule(project.id, parseInt(target), 1, cron, new Date());

  /**
   * Return the schedule.
   */
  return { schedule };
});

export { main };