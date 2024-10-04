import { DalClient } from '../../dal/client';
import { DateRangeParams } from '../../dal/types';
import { calculateCWVStats, calculateScores } from '../../../utils/stats';
import { HandleDelivery } from '../../../../common/utils/api';

/**
 * Handles the main logic for the API endpoint that lists targets.
 *
 * @param event - The AWS API Gateway event object.
 * @returns A Promise that resolves to the API Gateway response.
 */
const main = HandleDelivery(async (event: any) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  const target = await DalClient.getTargetByUUID(uuid!);
  const rangeParams: DateRangeParams = event.queryStringParameters || {};

  /**
   * Fetch the pulses for the provided Target
   */
  const result = await DalClient.listStatsPulsesByTarget(target.id, rangeParams);

  /**
   * Filter out pulses that don't have any completed heartbeats
   */
  const statPulses = result.filter((pulse: { heartbeats: { status: number }[] }) => pulse.heartbeats.every((heartbeat) => heartbeat.status === 4));

  /**
   * Calculate the scores and CWV stats for the provided pulses
   */
  const scores = calculateScores(statPulses);
  const cwvStats = calculateCWVStats(statPulses);

  return { target, cwvStats, scores };
});

export { main };