/**
 * Represents the result of a Lighthouse audit.
 */
export type LighthouseResult = {
  environment: {
    /**
     * The user agent used for the audit.
     */
    networkUserAgent: string;
  };
  /**
   * Categories of the Lighthouse audit results.
   */
  categories: {
    /**
     * Performance category result.
     */
    performance: any;
    /**
     * Accessibility category result.
     */
    accessibility: any;
    /**
     * Best practices category result.
     */
    'best-practices': any;
    /**
     * SEO category result.
     */
    seo: any;
  };
  /**
   * Detailed audits performed by Lighthouse.
   */
  audits: { [key: string]: any };
  /**
   * Configuration settings used for the Lighthouse audit.
   */
  configSettings: {
    /**
     * The emulated form factor (e.g., mobile, desktop).
     */
    emulatedFormFactor: string;
    /**
     * The locale used for the audit.
     */
    locale: string;
  };
  /**
   * Timing information for the audit.
   */
  timing: {
    /**
     * Total time taken for the audit in milliseconds.
     */
    total: number;
  };
  /**
   * The final URL that was audited.
   */
  finalUrl: string;
  /**
   * The URL that was requested to be audited.
   */
  requestedUrl: string;
};

/**
 * Represents a simplified result from a Lighthouse audit.
 */
export type SimplifiedLHResult = {
  /**
   * The user agent used for the audit.
   */
  userAgent: string;

  /**
   * The URL of the audited page.
   */
  url: string;

  /**
   * The mode in which the audit was run (e.g., 'navigation', 'timespan', 'snapshot').
   */
  mode: string;

  /**
   * The final URL after any redirects.
   */
  finalUrl: string;

  /**
   * The performance score of the page.
   */
  performance: number;

  /**
   * The accessibility score of the page.
   */
  accessibility: number;

  /**
   * The best practices score of the page.
   */
  bestPractices: number;

  /**
   * The SEO score of the page.
   */
  seo: number;

  /**
   * Various timing metrics of the page.
   */
  timings: {
    /**
     * Time to First Byte.
     */
    TTFB: number;

    /**
     * First Contentful Paint.
     */
    FCP: number;

    /**
     * Largest Contentful Paint.
     */
    LCP: number;

    /**
     * DOM Content Loaded.
     */
    DCL: number;

    /**
     * Speed Index.
     */
    SI: number;

    /**
     * Cumulative Layout Shift.
     */
    CLS: number;

    /**
     * Total Blocking Time.
     */
    TBT: number;

    /**
     * Time to Interactive.
     */
    TTI: number;
  };

  /**
   * Opportunities to improve the page's performance.
   */
  opportunities: Array<{
    /**
     * The identifier of the opportunity.
     */
    id: string;

    /**
     * The title of the opportunity.
     */
    title: string;

    /**
     * The description of the opportunity.
     */
    description: string;

    /**
     * The potential savings from implementing the opportunity.
     */
    savings: string;
  }>;

  /**
   * Diagnostics information about the page.
   */
  diagnostics: Array<{
    /**
     * The identifier of the diagnostic.
     */
    id: string;

    /**
     * The title of the diagnostic.
     */
    title: string;

    /**
     * The description of the diagnostic.
     */
    description: string;

    /**
     * Additional details about the diagnostic.
     */
    details: any;
  }>;

  /**
   * Summary of the resources used by the page.
   */
  resourceSummary: {
    /**
     * The total number of requests made by the page.
     */
    totalRequests: number;

    /**
     * The total transfer size of the resources.
     */
    totalTransferSize: number;

    /**
     * Breakdown of resource sizes and counts by type.
     */
    breakdown: { [key: string]: { size: number; count: number } };
  };
};

/**
 * Extracts a simplified summary from a raw Lighthouse report.
 *
 * @param rawData - The raw data of the Lighthouse report.
 * @returns The simplified summary of the Lighthouse report.
 */
const extractLighthouseSummary = (rawData: string, mode: string) => {
  const lhReport: LighthouseResult = JSON.parse(rawData);

  const simplifiedResult: SimplifiedLHResult = {
    mode,
    userAgent: lhReport.environment.networkUserAgent,
    url: lhReport.requestedUrl,
    finalUrl: lhReport.finalUrl,
    performance: lhReport.categories.performance.score * 100,
    accessibility: lhReport.categories.accessibility.score * 100,
    bestPractices: lhReport.categories['best-practices'].score * 100,
    seo: lhReport.categories.seo.score * 100,
    timings: {
      TTFB: lhReport.audits['metrics'].details.items[0]['timeToFirstByte'],
      FCP: lhReport.audits['first-contentful-paint'].numericValue,
      LCP: lhReport.audits['largest-contentful-paint'].numericValue,
      DCL: lhReport.audits['metrics'].details.items[0]['observedDomContentLoaded'],
      SI: lhReport.audits['speed-index'].numericValue,
      CLS: lhReport.audits['cumulative-layout-shift'].numericValue,
      TBT: lhReport.audits['total-blocking-time'].numericValue,
      TTI: lhReport.audits['interactive'].numericValue,
    },
    opportunities: Object.keys(lhReport.audits)
      .filter((key) => lhReport.audits[key].details?.type === 'opportunity')
      .map((key) => ({
        id: key,
        title: lhReport.audits[key].title,
        description: lhReport.audits[key].description,
        savings: lhReport.audits[key].details.overallSavingsMs + 'ms',
      })),
    diagnostics: Object.keys(lhReport.audits)
      .filter((key) => lhReport.audits[key].details?.type === 'diagnostic')
      .map((key) => ({
        id: key,
        title: lhReport.audits[key].title,
        description: lhReport.audits[key].description,
        details: lhReport.audits[key].details,
      })),
    resourceSummary: {
      totalRequests: lhReport.audits['resource-summary'].details.items.length,
      totalTransferSize: lhReport.audits['resource-summary'].details.items.reduce((acc: number, item: any) => acc + item.transferSize, 0),
      breakdown: lhReport.audits['resource-summary'].details.items.reduce((acc: any, item: any) => {
        acc[item.resourceType] = acc[item.resourceType] || { size: 0, count: 0 };
        acc[item.resourceType].size += item.transferSize;
        acc[item.resourceType].count += 1;
        return acc;
      }, {}),
    },
  };

  return { simplifiedResult };
};

export { extractLighthouseSummary };
