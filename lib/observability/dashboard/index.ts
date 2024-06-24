import { Duration, Stack } from 'aws-cdk-lib';
import { Dashboard, GraphWidget, Metric, PeriodOverride } from 'aws-cdk-lib/aws-cloudwatch';

const createDashboard = (stack: Stack) => {
  /**
   * Represents the CloudWatch dashboard.
   */
  const dashboard = new Dashboard(stack, `${stack.stackName}Dashboard`, {
    dashboardName: `${stack.stackName}Dashboard`,
    defaultInterval: Duration.days(7),
  });

  /**
   * Represents the First Content Paint (p90) widget.
   */
  const firstContentPaintWidget = new GraphWidget({
    title: 'First Content Paint (p90)',
    left: [
      new Metric({
        namespace: stack.stackName,
        metricName: 'first-contentful-paint',
        dimensionsMap: {
          Viewport: 'desktop',
          Stage: 'prod',
        },
        region: 'us-east-1',
        statistic: 'p90',
        period: Duration.hours(1),
      }),
      new Metric({
        namespace: stack.stackName,
        metricName: 'first-contentful-paint',
        dimensionsMap: {
          Viewport: 'mobile',
          Stage: 'prod',
        },
        region: 'us-east-1',
        statistic: 'p90',
        period: Duration.hours(1),
      }),
    ],
    width: 12,
    height: 6,
  });

  /**
   * Represents the Largest Content Paint (p90) widget.
   */
  const largestContentPaintWidget = new GraphWidget({
    title: 'Largest Content Paint (p90)',
    left: [
      new Metric({
        namespace: stack.stackName,
        metricName: 'largest-contentful-paint',
        dimensionsMap: {
          Viewport: 'desktop',
          Stage: 'prod',
        },
        region: 'us-east-1',
        statistic: 'p90',
        period: Duration.hours(1),
      }),
      new Metric({
        namespace: stack.stackName,
        metricName: 'largest-contentful-paint',
        dimensionsMap: {
          Viewport: 'mobile',
          Stage: 'prod',
        },
        region: 'us-east-1',
        statistic: 'p90',
        period: Duration.hours(1),
      }),
    ],
    width: 12,
    height: 6,
  });

  /**
   * Add the widgets to the dashboard.
   */
  dashboard.addWidgets(firstContentPaintWidget, largestContentPaintWidget);

  return { dashboard };
};

export { createDashboard };
