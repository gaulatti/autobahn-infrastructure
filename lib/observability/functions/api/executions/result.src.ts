import { buildCorsOutput } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';

/**
 * Handles the main logic for the API endpoint that retrieves execution details.
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = async (event: AWSLambda.APIGatewayEvent) => {
  const { pathParameters } = event;

  /**
   * Retrieve the execution ID from the path parameters.
   */
  const executionId = pathParameters!.uuid;

  /**
   * Retrieve the beacon details from the database.
   */
  const output = await DalClient.getBeaconByUUID(executionId!);
  return buildCorsOutput(event, 200, output);
};

export { main };
