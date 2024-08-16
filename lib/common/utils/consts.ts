/**
 * PageSpeedInsights ENUM data.
 */
const PAGE_SPEED_INSIGHTS = 'PAGE_SPEED_INSIGHTS';
const ECS_LIGHTHOUSE = 'ECS_LIGHTHOUSE';

/**
 * Stage ENUM data.
 */
const ALPHA = 'ALPHA';
const BETA = 'BETA';
const STAGING = 'STAGING';
const PRODUCTION = 'PRODUCTION';

/**
 * TeamRole ENUM data.
 */
const ADMIN = 'ADMIN';
const MAINTAINER = 'MAINTAINER';
const MEMBER = 'MEMBER';
const VIEWER = 'VIEWER';

/**
 * ViewportMode ENUM data.
 */
const MOBILE = 'MOBILE';
const DESKTOP = 'DESKTOP';

/**
 * BeaconStatus ENUM data.
 */
const PENDING = 'PENDING';
const RUNNING = 'RUNNING';
const LIGHTHOUSE_FINISHED = 'LIGHTHOUSE_FINISHED';
const PLEASANTNESS_FINISHED = 'PLEASANTNESS_FINISHED';
const DONE = 'DONE';
const FAILED = 'FAILED';
const RETRYING = 'RETRYING';

/**
 * StatisticPeriod ENUM data.
 */
const HOURLY = 'HOURLY';
const DAILY = 'DAILY';
const WEEKLY = 'WEEKLY';
const MONTHLY = 'MONTHLY';
/**
 * StatisticMetric ENUM data.
 */
const P90 = 'P90';
const P95 = 'P95';
const P99 = 'P99';
const AVG = 'AVG';
const MEDIAN = 'MEDIAN';
const MIN = 'MIN';
const MAX = 'MAX';

const ENUMS = {
  BeaconProvider: [PAGE_SPEED_INSIGHTS, ECS_LIGHTHOUSE],
  Stage: [ALPHA, BETA, STAGING, PRODUCTION],
  TeamRole: [ADMIN, MAINTAINER, MEMBER, VIEWER],
  ViewportMode: [MOBILE, DESKTOP],
  BeaconStatus: [PENDING, RUNNING, LIGHTHOUSE_FINISHED, PLEASANTNESS_FINISHED, DONE, FAILED, RETRYING],
  StatisticPeriod: [HOURLY, DAILY, WEEKLY, MONTHLY],
  StatisticMetric: [P90, P95, P99, AVG, MEDIAN, MIN, MAX],
}

export {
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
  RETRYING,
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
  ENUMS,
};
