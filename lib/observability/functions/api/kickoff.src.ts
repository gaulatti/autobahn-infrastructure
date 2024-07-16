import {
  PAGE_SPEED_INSIGHTS,
  ECS_LIGHTHOUSE,
  ALPHA,
  BETA,
  STAGING,
  PRODUCTION,
  ADMIN,
  MAINTAINER,
  MEMBER,
  VIEWER,
  MOBILE,
  DESKTOP,
  PENDING,
  RUNNING,
  LIGHTHOUSE_FINISHED,
  PLEASANTNESS_FINISHED,
  DONE,
  FAILED,
  HOURLY,
  DAILY,
  WEEKLY,
  MONTHLY,
  P90,
  P95,
  P99,
  AVG,
  MEDIAN,
  MIN,
  MAX,
} from '../../../common/utils/consts';
import { DalClient } from '../dal/client';
/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: { field: string; sub: string; arguments: Record<string, string> }) => {
  const { field, sub } = event;

  switch (field) {
    /**
     * Declare the kickoff object with ENUM data.
     */
    case 'kickoff':
      return {
        kickoff: {
          enums: {
            BeaconProvider: [PAGE_SPEED_INSIGHTS, ECS_LIGHTHOUSE],
            Stage: [ALPHA, BETA, STAGING, PRODUCTION],
            TeamRole: [ADMIN, MAINTAINER, MEMBER, VIEWER],
            ViewportMode: [MOBILE, DESKTOP],
            BeaconStatus: [PENDING, RUNNING, LIGHTHOUSE_FINISHED, PLEASANTNESS_FINISHED, DONE, FAILED],
            StatisticPeriod: [HOURLY, DAILY, WEEKLY, MONTHLY],
            StatisticMetric: [P90, P95, P99, AVG, MEDIAN, MIN, MAX],
          },
        },
      };

    /**
     * Get the user by their sub.
     */
    case 'me':
      return { me: await DalClient.getUserBySub(sub) };

    default:
      throw new Error(`Unknown field: ${field}`);
  }
};

export { main };
