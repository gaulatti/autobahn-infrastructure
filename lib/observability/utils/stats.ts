import { mean, percentile } from 'stats-lite';

/**
 * Represents the details of CWV (Core Web Vitals) stats.
 */
export interface CWVStatsDetails {
  values: Record<string, number>;
  variation: number;
  datapoints: Record<string, { value: number; uuid: string }>;
}

/**
 * Represents an entry for Core Web Vitals (CWV) statistics.
 */
export interface CWVStatsEntry {
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
export interface ScoreDetails {
  scores: Record<string, number>;
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
export interface ScoreEntry {
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
 * @returns The calculated metric values.
 * @throws {Error} If an unsupported metric is provided.
 */
const getMetrics = (scores: number[]): Record<string, number> => {
  return {
    p90: Math.round(percentile(scores, 0.9)),
    p99: Math.round(percentile(scores, 0.99)),
    p50: Math.round(percentile(scores, 0.5)),
    max: Math.round(Math.max(...scores)),
    min: Math.round(Math.min(...scores)),
    avg: Math.round(mean(scores)),
  };
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
const calculateScores = (data: any[]): ScoreEntry[] => {
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
          scores: getMetrics(mobileScores.performance),
          variation: calculateVariation(mobileScores.performance),
        },
        desktop: {
          scores: getMetrics(desktopScores.performance),
          variation: calculateVariation(desktopScores.performance),
        },
      },
    },
    {
      name: 'Accessibility',
      scores: {
        mobile: {
          scores: getMetrics(mobileScores.accessibility),
          variation: calculateVariation(mobileScores.accessibility),
        },
        desktop: {
          scores: getMetrics(desktopScores.accessibility),
          variation: calculateVariation(desktopScores.accessibility),
        },
      },
    },
    {
      name: 'Best Practices',
      scores: {
        mobile: {
          scores: getMetrics(mobileScores.bestPractices),
          variation: calculateVariation(mobileScores.bestPractices),
        },
        desktop: {
          scores: getMetrics(desktopScores.bestPractices),
          variation: calculateVariation(desktopScores.bestPractices),
        },
      },
    },
    {
      name: 'SEO',
      scores: {
        mobile: {
          scores: getMetrics(mobileScores.seo),
          variation: calculateVariation(mobileScores.seo),
        },
        desktop: {
          scores: getMetrics(desktopScores.seo),
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
 * @returns A CWVStatsDetails object with the calculated value, variation, and datapoints.
 */
const createStatsDetails = (metrics: { timestamp: string; value: number; uuid: string }[]): CWVStatsDetails => {
  const values = metrics.map((m) => m.value);
  const datapoints = metrics.reduce((acc, { timestamp, value, uuid }) => {
    acc[timestamp] = {
      uuid,
      value,
    };
    return acc;
  }, {} as Record<string, { value: number; uuid: string }>);

  return {
    values: getMetrics(values),
    variation: calculateVariation(values),
    datapoints,
  };
};

/**
 * Calculates CWV (Core Web Vitals) statistics based on the provided data and metric.
 *
 * @param data - An array of data containing pulses and heartbeats.
 * @returns An array of CWVStatsEntry objects representing the calculated CWV stats.
 */
const calculateCWVStats = (data: any[]): CWVStatsEntry[] => {
  const mobileMetrics = {
    ttfb: [] as { timestamp: string; value: number; uuid: string }[],
    fcp: [] as { timestamp: string; value: number; uuid: string }[],
    dcl: [] as { timestamp: string; value: number; uuid: string }[],
    si: [] as { timestamp: string; value: number; uuid: string }[],
    lcp: [] as { timestamp: string; value: number; uuid: string }[],
    tti: [] as { timestamp: string; value: number; uuid: string }[],
  };

  const desktopMetrics = {
    ttfb: [] as { timestamp: string; value: number; uuid: string }[],
    fcp: [] as { timestamp: string; value: number; uuid: string }[],
    dcl: [] as { timestamp: string; value: number; uuid: string }[],
    si: [] as { timestamp: string; value: number; uuid: string }[],
    lcp: [] as { timestamp: string; value: number; uuid: string }[],
    tti: [] as { timestamp: string; value: number; uuid: string }[],
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
        mobile: createStatsDetails(mobileMetrics.ttfb),
        desktop: createStatsDetails(desktopMetrics.ttfb),
      },
    },
    {
      name: 'FCP',
      stats: {
        mobile: createStatsDetails(mobileMetrics.fcp),
        desktop: createStatsDetails(desktopMetrics.fcp),
      },
    },
    {
      name: 'DCL',
      stats: {
        mobile: createStatsDetails(mobileMetrics.dcl),
        desktop: createStatsDetails(desktopMetrics.dcl),
      },
    },
    {
      name: 'SI',
      stats: {
        mobile: createStatsDetails(mobileMetrics.si),
        desktop: createStatsDetails(desktopMetrics.si),
      },
    },
    {
      name: 'LCP',
      stats: {
        mobile: createStatsDetails(mobileMetrics.lcp),
        desktop: createStatsDetails(desktopMetrics.lcp),
      },
    },
    {
      name: 'TTI',
      stats: {
        mobile: createStatsDetails(mobileMetrics.tti),
        desktop: createStatsDetails(desktopMetrics.tti),
      },
    },
  ];

  return result;
};

export { calculateScores, calculateCWVStats };