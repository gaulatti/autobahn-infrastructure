import { HandleDelivery } from '../../../../common/utils/api';
import { calculateCWVStats, calculateScores } from '../../../utils/stats';
import { DalClient } from '../../dal/client';
import { DateRangeParams } from '../../dal/types';

const main = HandleDelivery(async (event: any) => {
  const { pathParameters } = event;
  const { uuid } = pathParameters!;

  const urlRecord = await DalClient.getURLByUUID(uuid);
  const rangeParams: DateRangeParams = event.queryStringParameters || {};

  /**
   * Fetch the pulses for the provided URL
   */
  const result = await DalClient.listStatsPulsesByURL(urlRecord.id, rangeParams);

  /**
   * Filter out pulses that don't have any completed heartbeats
   */
  const statPulses = result.filter((pulse: { heartbeats: { status: number }[] }) => pulse.heartbeats.every((heartbeat) => heartbeat.status === 4));

  /**
   * Calculate the scores and CWV stats for the provided pulses
   */
  const scores = calculateScores(statPulses);
  const cwvStats = calculateCWVStats(statPulses);

  return { urlRecord, cwvStats, scores };
});

export { main };