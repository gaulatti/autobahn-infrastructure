import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';

/**
 * Handles the delivery of an API Gateway event to update a baseline.
 *
 * @param event - The API Gateway event containing the request data.
 * @returns An object containing the updated baseline.
 *
 * @throws Will throw an error if the target is not found.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { uuid } = event.pathParameters!;
  const { stat, value, isMobile } = JSON.parse(event.body!);

  /**
   * Fetch the target.
   */
  const target = await DalClient.getTargetByUUID(uuid!);

  /**
   * Throw an error if the target is not found.
   */
  if (!target) {
    throw new Error('Target not found');
  }

  /**
   * Find the baseline for the target.
   */
  let baseline = target.baselines.find((item: { mode: number }) => item.mode === (isMobile ? 0 : 1));

  if (!baseline) {
    /**
     * Create a new baseline.
     */
    baseline = await DalClient.createBaseline(target.id, isMobile ? 0 : 1, { [stat.toLowerCase()]: parseInt(value) });
  } else {
    /**
     * Update the baseline.
     */
    baseline = await DalClient.updateBaseline(target.id, isMobile ? 0 : 1, { [stat.toLowerCase()]: parseInt(value) });
  }

  return { baseline };
});

export { main };