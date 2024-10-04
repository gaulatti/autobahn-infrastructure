import { randomUUID } from 'crypto';
import { DalClient } from '../../dal/client';
import { HandleDelivery } from '../../../../common/utils/api';

/**
 * Main handler for creating a target.
 *
 * @param event - The API Gateway event containing the request data.
 * @returns The created target record.
 *
 * @remarks
 * This function handles the delivery of the request, extracts the target and stage from the request body,
 * fetches or creates a URL record, and then creates a target. Currently, only URL-based targets are supported.
 *
 * @example
 * ```typescript
 * const event = {
 *   body: JSON.stringify({ target: 'example.com', stage: '1' })
 * };
 * const result = await main(event);
 * console.log(result);
 * ```
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  /**
   * Extract the target from the request body.
   */
  const { target, stage, name } = JSON.parse(event.body!);

  /**
   * Fetch the URL record.
   */
  let urlRecord = (await DalClient.getURL(target)) || (await DalClient.createURL(target, randomUUID()));

  /**
   * Create the target. By now only URL-based targets are supported.
   */
  const record = await DalClient.createTarget(parseInt(stage), 1, name, urlRecord.id);

  return record;
});

export { main };