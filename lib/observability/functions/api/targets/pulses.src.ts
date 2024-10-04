import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ListRenderingParams } from '../../dal/types';

/**
 * Handles the main logic for the API endpoint that lists executions.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  const target = await DalClient.getTargetByUUID(uuid!);

  const renderingParams: ListRenderingParams = event.queryStringParameters?.startRow
    ? (event.queryStringParameters as unknown as ListRenderingParams)
    : {
        startRow: '0',
        endRow: '100',
        sort: '',
        filters: '{}',
      };

  const output = { pulses: await DalClient.listPulsesByTarget(target.id, renderingParams) };

  return output;
});

export { main };