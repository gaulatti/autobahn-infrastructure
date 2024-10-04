import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ListRenderingParams } from '../../dal/types';

/**
 * Handles the main logic for the API endpoint that lists executions for a specific URL.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  const urlRecord = await DalClient.getURLByUUID(uuid!);
  const renderingParams: ListRenderingParams = (event.queryStringParameters as unknown as ListRenderingParams) || {};

  const pulses = await DalClient.listPulsesByURL(urlRecord.id, renderingParams);

  return { pulses };
});

export { main };
