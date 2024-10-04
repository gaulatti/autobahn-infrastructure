import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';

/**
 * Handles the delivery of an API Gateway event to list schedules.
 *
 * @param event - The API Gateway event containing the request details.
 * @returns The project details retrieved by UUID.
 *
 * @remarks
 * This function uses the `HandleDelivery` wrapper to process the event asynchronously.
 * It extracts the `uuid` from the path parameters and retrieves the corresponding project
 * using the `DalClient.getProjectByUUID` method.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  /**
   * Fetch the project.
   */
  const project = await DalClient.getProjectByUUID(uuid!);

  /**
   * Return the schedules for the project.
   */
  return { schedules: project.schedules || [] };
});

export { main };
