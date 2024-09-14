import { HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { DateRangeParams } from '../../dal/types';
import { percentile, mean } from 'stats-lite';

/**
 * Represents the details of CWV (Core Web Vitals) stats.
 */
interface CWVStatsDetails {
  value: number;
  variation: number;
  datapoints: Record<string, { value: number, uuid: string}>;
}

/**
 * Represents an entry for Core Web Vitals (CWV) statistics.
 */
interface CWVStatsEntry {
  name: string;
  stats: {
    mobile: CWVStatsDetails;
    desktop: CWVStatsDetails;
  };
}

/**
 * Represents the details of a score.
 *
 * @interface ScoreDetails
 * @property {number} score - The score value.
 * @property {number} variation - The variation value.
 */
interface ScoreDetails {
  score: number;
  variation: number;
}

/**
 * Represents a score entry.
 *
 * @interface ScoreEntry
 * @property {string} name - The name of the score entry.
 * @property {Object} scores - The scores for mobile and desktop.
 * @property {ScoreDetails} scores.mobile - The score details for mobile.
 * @property {ScoreDetails} scores.desktop - The score details for desktop.
 */
interface ScoreEntry {
  name: string;
  scores: {
    mobile: ScoreDetails;
    desktop: ScoreDetails;
  };
}

/**
 * Calculates a metric value based on an array of scores.
 *
 * @param scores - The array of scores.
 * @param metric - The metric to calculate. Supported metrics are 'p90', 'p99', 'p50', 'max', 'min', and 'average'.
 * @returns The calculated metric value.
 * @throws {Error} If an unsupported metric is provided.
 */
const getMetric = (scores: number[], metric: string): number => {
  switch (metric) {
    case 'p90':
      return Math.round(percentile(scores, 0.9));
    case 'p99':
      return Math.round(percentile(scores, 0.99));
    case 'p50':
      return Math.round(percentile(scores, 0.5));
    case 'max':
      return Math.round(Math.max(...scores));
    case 'min':
      return Math.round(Math.min(...scores));
    case 'average':
      return Math.round(mean(scores));
    default:
      throw new Error('Unsupported metric');
  }
};

/**
 * Calculates the variation between the first and last score in an array of scores.
 *
 * @param scores - An array of numbers representing the scores.
 * @returns The calculated variation as a number rounded to 1 decimal.
 */
const calculateVariation = (scores: number[]): number => {
  /**
   * If there are less than 2 scores, we can't calculate the variation
   */
  if (scores.length < 2) {
    return 0;
  }

  /**
   * Calculate the variation between the first and last score
   */
  const last = scores[scores.length - 1];
  const first = scores[0];
  const variation = ((last - first) / first) * 100;

  /**
   * Round the variation to 1 decimal
   */
  return Math.round(variation * 10) / 10;
};

/**
 * Calculates the scores for a given data array and metric.
 *
 * @param data - The data array containing pulses and heartbeats.
 * @param metric - The metric to calculate the scores for.
 * @returns An array of ScoreEntry objects representing the calculated scores.
 */
const calculateScores = (data: any[], metric: string): ScoreEntry[] => {
  /**
   * Create an object to store the mobile scores
   */
  const mobileScores = {
    performance: [] as number[],
    accessibility: [] as number[],
    bestPractices: [] as number[],
    seo: [] as number[],
  };

  /**
   * Create an object to store the desktop scores
   */
  const desktopScores = {
    performance: [] as number[],
    accessibility: [] as number[],
    bestPractices: [] as number[],
    seo: [] as number[],
  };

  /**
   * Iterate over the pulses and heartbeats to collect the scores
   */
  data.forEach((pulse) => {
    pulse.heartbeats.forEach((heartbeat: any) => {
      const scores = heartbeat.mode === 0 ? mobileScores : desktopScores;

      scores.performance.push(parseFloat(heartbeat.performance_score));
      scores.accessibility.push(parseFloat(heartbeat.accessibility_score));
      scores.bestPractices.push(parseFloat(heartbeat.best_practices_score));
      scores.seo.push(parseFloat(heartbeat.seo_score));
    });
  });

  /**
   * Create the result object with the calculated scores
   */
  const result: ScoreEntry[] = [
    {
      name: 'Performance',
      scores: {
        mobile: {
          score: getMetric(mobileScores.performance, metric),
          variation: calculateVariation(mobileScores.performance),
        },
        desktop: {
          score: getMetric(desktopScores.performance, metric),
          variation: calculateVariation(desktopScores.performance),
        },
      },
    },
    {
      name: 'Accessibility',
      scores: {
        mobile: {
          score: getMetric(mobileScores.accessibility, metric),
          variation: calculateVariation(mobileScores.accessibility),
        },
        desktop: {
          score: getMetric(desktopScores.accessibility, metric),
          variation: calculateVariation(desktopScores.accessibility),
        },
      },
    },
    {
      name: 'Best Practices',
      scores: {
        mobile: {
          score: getMetric(mobileScores.bestPractices, metric),
          variation: calculateVariation(mobileScores.bestPractices),
        },
        desktop: {
          score: getMetric(desktopScores.bestPractices, metric),
          variation: calculateVariation(desktopScores.bestPractices),
        },
      },
    },
    {
      name: 'SEO',
      scores: {
        mobile: {
          score: getMetric(mobileScores.seo, metric),
          variation: calculateVariation(mobileScores.seo),
        },
        desktop: {
          score: getMetric(desktopScores.seo, metric),
          variation: calculateVariation(desktopScores.seo),
        },
      },
    },
  ];

  return result;
};

/**
 * Creates a CWVStatsDetails object based on the provided metrics and metric name.
 *
 * @param metrics - An array of metric objects containing timestamp and value.
 * @param metric - The name of the metric to be used for calculating the value.
 * @returns A CWVStatsDetails object with the calculated value, variation, and datapoints.
 */
const createStatsDetails = (metrics: { timestamp: string; value: number, uuid: string }[], metric: string): CWVStatsDetails => {
  const values = metrics.map((m) => m.value);
  const datapoints = metrics.reduce((acc, { timestamp, value, uuid }) => {
    acc[timestamp] = {
      uuid,
      value,
    };
    return acc;
  }, {} as Record<string, { value: number, uuid: string}>);

  return {
    value: getMetric(values, metric),
    variation: calculateVariation(values),
    datapoints,
  };
};

/**
 * Calculates CWV (Core Web Vitals) statistics based on the provided data and metric.
 *
 * @param data - An array of data containing pulses and heartbeats.
 * @param metric - The metric to calculate the CWV stats for.
 * @returns An array of CWVStatsEntry objects representing the calculated CWV stats.
 */
const calculateCWVStats = (data: any[], metric: string): CWVStatsEntry[] => {
  const mobileMetrics = {
    ttfb: [] as { timestamp: string; value: number, uuid: string }[],
    fcp: [] as { timestamp: string; value: number, uuid: string }[],
    dcl: [] as { timestamp: string; value: number, uuid: string }[],
    si: [] as { timestamp: string; value: number, uuid: string }[],
    lcp: [] as { timestamp: string; value: number, uuid: string }[],
    tti: [] as { timestamp: string; value: number, uuid: string }[],
  };

  const desktopMetrics = {
    ttfb: [] as { timestamp: string; value: number, uuid: string }[],
    fcp: [] as { timestamp: string; value: number, uuid: string }[],
    dcl: [] as { timestamp: string; value: number, uuid: string }[],
    si: [] as { timestamp: string; value: number, uuid: string }[],
    lcp: [] as { timestamp: string; value: number, uuid: string }[],
    tti: [] as { timestamp: string; value: number, uuid: string }[],
  };

  /**
   * Iterate over the pulses and heartbeats to collect the metrics
   */
  data.forEach((pulse) => {
    pulse.heartbeats.forEach((heartbeat: any) => {
      const metrics = heartbeat.mode === 0 ? mobileMetrics : desktopMetrics;
      const timestamp = pulse.created_at;

      metrics.ttfb.push({ timestamp, value: parseFloat(heartbeat.ttfb), uuid: pulse.uuid });
      metrics.fcp.push({ timestamp, value: parseFloat(heartbeat.fcp), uuid: pulse.uuid });
      metrics.dcl.push({ timestamp, value: parseFloat(heartbeat.dcl), uuid: pulse.uuid });
      metrics.si.push({ timestamp, value: parseFloat(heartbeat.si), uuid: pulse.uuid });
      metrics.lcp.push({ timestamp, value: parseFloat(heartbeat.lcp), uuid: pulse.uuid });
      metrics.tti.push({ timestamp, value: parseFloat(heartbeat.tti), uuid: pulse.uuid });
    });
  });

  /**
   * Create the result object with the calculated CWV stats
   */
  const result: CWVStatsEntry[] = [
    {
      name: 'TTFB',
      stats: {
        mobile: createStatsDetails(mobileMetrics.ttfb, metric),
        desktop: createStatsDetails(desktopMetrics.ttfb, metric),
      },
    },
    {
      name: 'FCP',
      stats: {
        mobile: createStatsDetails(mobileMetrics.fcp, metric),
        desktop: createStatsDetails(desktopMetrics.fcp, metric),
      },
    },
    {
      name: 'DCL',
      stats: {
        mobile: createStatsDetails(mobileMetrics.dcl, metric),
        desktop: createStatsDetails(desktopMetrics.dcl, metric),
      },
    },
    {
      name: 'SI',
      stats: {
        mobile: createStatsDetails(mobileMetrics.si, metric),
        desktop: createStatsDetails(desktopMetrics.si, metric),
      },
    },
    {
      name: 'LCP',
      stats: {
        mobile: createStatsDetails(mobileMetrics.lcp, metric),
        desktop: createStatsDetails(desktopMetrics.lcp, metric),
      },
    },
    {
      name: 'TTI',
      stats: {
        mobile: createStatsDetails(mobileMetrics.tti, metric),
        desktop: createStatsDetails(desktopMetrics.tti, metric),
      },
    },
  ];

  return result;
};

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
  const metric = event.queryStringParameters.statistic;
  const scores = calculateScores(statPulses, metric);
  const cwvStats = calculateCWVStats(statPulses, metric);

  return { urlRecord, cwvStats, scores };
});

export { main };
