import { Duration, Stack } from 'aws-cdk-lib';
import { WebSocketApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Topic } from 'aws-cdk-lib/aws-sns';

/**
 * Creates a processing Lambda function for handling S3 events.
 * @param stack - The AWS CloudFormation stack.
 * @param bucket - The S3 bucket to process events from.
 * @param dataAccessLambda - The data access Lambda function.
 * @returns An object containing the processing Lambda function.
 */
const createProcessingLambda = (
  stack: Stack,
  defaultApiEnvironment: Record<string, string>,
  observabilityBucket: Bucket,
  dataAccessLambda: NodejsFunction,
  webSocketApi: WebSocketApi
) => {
  /**
   * Create Processing Lambda
   */
  const processingLambda = new NodejsFunction(stack, `${stack.stackName}ProcessingLambda`, {
    functionName: `${stack.stackName}Processing`,
    entry: './lib/observability/functions/background/processing.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    environment: {
      ...defaultApiEnvironment,
      BUCKET_NAME: observabilityBucket.bucketName,
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      WEBSOCKET_API_FQDN: `${webSocketApi.apiId}.execute-api.${stack.region}.amazonaws.com`,
    },
    memorySize: 1024,
  });

  /**
   * Grant Permissions for managing connections in the WebSocket API
   */
  webSocketApi.grantManageConnections(processingLambda);

  /**
   * Grant Permissions for reading from the bucket and posting to CloudWatch
   */
  observabilityBucket.grantReadWrite(processingLambda);
  processingLambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['cloudwatch:PutMetricData'],
      resources: ['*'],
    })
  );

  /**
   * Add S3 Event Notification. This will trigger the Lambda function when an object is created in the bucket.
   */
  observabilityBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(processingLambda));

  /**
   * Allow this lambda to save the metrics in the Database.
   */
  dataAccessLambda.grantInvoke(processingLambda);

  return { processingLambda };
};

const createFailureHandlerLambda = (
  stack: Stack,
  defaultApiEnvironment: Record<string, string>,
  dataAccessLambda: NodejsFunction,
  webSocketApi: WebSocketApi,
  triggerTopic: Topic
) => {
  /**
   * Create Failure Handler Lambda
   */
  const failureHandlerLambda = new NodejsFunction(stack, `${stack.stackName}FailureHandlerLambda`, {
    functionName: `${stack.stackName}FailureHandler`,
    entry: './lib/observability/functions/background/failure.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    environment: {
      ...defaultApiEnvironment,
      TRIGGER_TOPIC_ARN: triggerTopic.topicArn,
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      WEBSOCKET_API_FQDN: `${webSocketApi.apiId}.execute-api.${stack.region}.amazonaws.com`,
    },
    memorySize: 1024,
  });

  /**
   * Grant Permissions for managing connections in the WebSocket API
   */
  webSocketApi.grantManageConnections(failureHandlerLambda);

  /**
   * Allow this lambda to save the metrics in the Database.
   */
  dataAccessLambda.grantInvoke(failureHandlerLambda);

  /**
   * Grant permissions to publish to the trigger topic
   */
  triggerTopic.grantPublish(failureHandlerLambda);

  return { failureHandlerLambda };
};

const createEngineMonitorLambda = (
  stack: Stack,
  defaultApiEnvironment: Record<string, string>,
  dataAccessLambda: NodejsFunction,
  webSocketApi: WebSocketApi,
  triggerTopic: Topic
) => {
  /**
   * Create Failure Handler Lambda
   */
  const engineMonitorLambda = new NodejsFunction(stack, `${stack.stackName}EngineMonitorLambda`, {
    functionName: `${stack.stackName}EngineMonitor`,
    entry: './lib/observability/functions/background/engine/monitor.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    environment: {
      ...defaultApiEnvironment,
      TRIGGER_TOPIC_ARN: triggerTopic.topicArn,
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      WEBSOCKET_API_FQDN: `${webSocketApi.apiId}.execute-api.${stack.region}.amazonaws.com`,
    },
    memorySize: 1024,
  });

  /**
   * Grant Permissions for managing connections in the WebSocket API
   */
  webSocketApi.grantManageConnections(engineMonitorLambda);

  /**
   * Allow this lambda to save the metrics in the Database.
   */
  dataAccessLambda.grantInvoke(engineMonitorLambda);

  /**
   * Grant permissions to publish to the trigger topic
   */
  triggerTopic.grantPublish(engineMonitorLambda);

  /**
   * Run every minute to check scheduled executions
   */
  const rule = new Rule(stack, `${stack.stackName}EngineMonitorSchedule`, {
    schedule: Schedule.rate(Duration.minutes(1)),
  });

  rule.addTarget(new LambdaFunction(engineMonitorLambda));

  return { engineMonitorLambda };
};

export { createProcessingLambda, createFailureHandlerLambda, createEngineMonitorLambda };
