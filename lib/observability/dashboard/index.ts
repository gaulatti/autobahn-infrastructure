import { Duration, Stack } from 'aws-cdk-lib';
import { Alarm, ComparisonOperator, Dashboard, GraphWidget, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { capitalize, kebabToCamel } from '../../common/utils';

interface MonitoredMetric {
  name: string;
  alarm: {
    desktopThreshold: number;
    mobileThreshold: number;
    evaluationPeriods: number;
    comparisonOperator: ComparisonOperator;
  };
}

/**
 * Creates a CloudWatch dashboard with monitored metrics.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the created dashboard.
 */
const createDashboard = (stack: Stack) => {
  /**
   * Represents the CloudWatch dashboard.
   */
  const dashboard = new Dashboard(stack, `${stack.stackName}Dashboard`, {
    dashboardName: `${stack.stackName}`,
    defaultInterval: Duration.days(7),
  });

  /**
   * Represents the monitored metrics.
   */
  const monitoredMetrics: Record<string, MonitoredMetric> = {
    'first-contentful-paint': {
      name: 'First Contentful Paint (p90)',
      alarm: {
        desktopThreshold: 3500,
        mobileThreshold: 5000,
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    },
    'largest-contentful-paint': {
      name: 'Largest Contentful Paint (p90)',
      alarm: {
        desktopThreshold: 10000,
        mobileThreshold: 23000,
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    },
    interactive: {
      name: 'Time to Interactive (p90)',
      alarm: {
        desktopThreshold: 14000,
        mobileThreshold: 54000,
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    },
    'speed-index': {
      name: 'Speed Index (p90)',
      alarm: {
        desktopThreshold: 7000,
        mobileThreshold: 21000,
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    },
    'total-blocking-time': {
      name: 'Total Blocking Time (p90)',
      alarm: {
        desktopThreshold: 500,
        mobileThreshold: 6000,
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    },
    'cumulative-layout-shift': {
      name: 'Cumulative Layout Shift (p90)',
      alarm: {
        desktopThreshold: 0.2,
        mobileThreshold: 0.2,
        evaluationPeriods: 3,
        comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      },
    },
  };

  /**
   * For every monitored metric, add it as a widget with its p90 value for both desktop and mobile.
   */
  let counter = 0;
  let row: GraphWidget[] = [];
  for (const [metricName, metric] of Object.entries(monitoredMetrics)) {
    counter++;

    const widgetMetrics: Metric[] = [];

    for (const viewport of ['desktop', 'mobile']) {
      /**
       * Represents the metric for the widget.
       */
      const widgetMetric = new Metric({
        namespace: stack.stackName,
        metricName,
        dimensionsMap: {
          Viewport: viewport,
          Stage: 'prod',
        },
        region: 'us-east-1',
        statistic: 'p90',
        period: Duration.hours(1),
      });

      /**
       * Represents the alarm metric. This is different than the widget metric
       * because it has a different period as we need to alarm sudden changes quickly.
       */
      const alarmMetric = new Metric({
        namespace: stack.stackName,
        metricName,
        dimensionsMap: {
          Viewport: viewport,
          Stage: 'prod',
        },
        region: 'us-east-1',
        statistic: 'p90',
        period: Duration.minutes(5),
      });

      const threshold = viewport === 'desktop' ? metric.alarm.desktopThreshold : metric.alarm.mobileThreshold;

      /**
       * Represents the alarm for the metric.
       */
      const alarm = new Alarm(stack, `${stack.stackName}${kebabToCamel(metricName)}${capitalize(viewport)}Alarm`, {
        metric: alarmMetric,
        threshold,
        evaluationPeriods: 3,
        comparisonOperator: metric.alarm.comparisonOperator,
        alarmDescription: `Alarm when ${metric.name} (${viewport}) exceeds ${threshold} for 3 periods`,
        alarmName: `${stack.stackName}${kebabToCamel(metricName)}${capitalize(viewport)}Alarm`,
      });

      widgetMetrics.push(widgetMetric);
    }

    /**
     * Represents the widget itself with alarm lines.
     */
    const widget = new GraphWidget({
      title: metric.name,
      left: widgetMetrics,
      width: 12,
      height: 6,
      leftAnnotations: [
        {
          label: `Desktop Alarm / 3 datapoints in 15min`,
          value: metric.alarm.desktopThreshold,
        },
        {
          label: `Mobile Alarm / 3 datapoints in 15min`,
          value: metric.alarm.mobileThreshold,
        },
      ],
    });

    row.push(widget);

    /**
     * If the row is full, Add the widgets to the dashboard.
     */
    if (counter % 2 == 0) {
      dashboard.addWidgets(...row);
      row = [];
    }
  }
  return { dashboard };
};

export { createDashboard };
