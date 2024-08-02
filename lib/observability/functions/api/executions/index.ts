import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { buildLambdaSpecs } from '../../../../common/utils/api';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

/**
 * Creates the Executions Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @returns An object containing the `executionsLambda` function.
 */
const createExecutionsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const executionsLambda = new NodejsFunction(stack, `${stack.stackName}ExecutionsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'Executions', './lib/observability/functions/api/executions/list.src.ts', defaultApiEnvironment),
  });

  return { executionsLambda };
};

/**
 * Creates a trigger execution lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @param triggerTopic - The SNS topic used as a trigger.
 * @returns An object containing the trigger execution lambda function.
 */
const createTriggerExecutionLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>, triggerTopic: Topic) => {
  /**
   * The environment variables for the trigger execution lambda function.
   */
  const environment = {
    ...defaultApiEnvironment,
    TRIGGER_TOPIC_ARN: triggerTopic.topicArn,
  };

  /**
   * Create the trigger execution lambda function.
   */
  const triggerExecutionLambda = new NodejsFunction(stack, `${stack.stackName}TriggerExecutionLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'TriggerExecution', './lib/observability/functions/api/executions/trigger.src.ts', environment),
  });

  /**
   * Grant the trigger execution lambda the permission to publish to the trigger topic.
   */
  triggerTopic.grantPublish(triggerExecutionLambda);

  return { triggerExecutionLambda };
};

/**
 * Creates an execution result lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @returns An object containing the triggerExecutionLambda function.
 */
const createExecutionResultLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const executionResultLambda = new NodejsFunction(stack, `${stack.stackName}ExecutionResultLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'ExecutionResult', './lib/observability/functions/api/executions/result.src.ts', defaultApiEnvironment),
  });

  return { executionResultLambda };
};

/**
 * Creates an execution details lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default API environment.
 * @returns An object containing the execution details lambda function.
 */
const createExecutionDetailsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>, observabilityBucket: Bucket) => {
  const environment = {
    ...defaultApiEnvironment,
    BUCKET_NAME: observabilityBucket.bucketName,
  };
  const executionDetailsLambda = new NodejsFunction(stack, `${stack.stackName}ExecutionDetailsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'ExecutionDetails', './lib/observability/functions/api/executions/details.src.ts', environment),
  });

  observabilityBucket.grantRead(executionDetailsLambda);

  return { executionDetailsLambda };
};

export { createExecutionDetailsLambda, createExecutionResultLambda, createExecutionsLambda, createTriggerExecutionLambda };

