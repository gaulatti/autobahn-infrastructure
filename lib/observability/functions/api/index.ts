import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { createExecutionDetailsLambda, createExecutionResultLambda, createExecutionsLambda, createRetryExecutionLambda, createTriggerExecutionLambda } from './executions';
import { createKickoffLambda } from './kickoff';
import { WebSocketApi } from 'aws-cdk-lib/aws-apigatewayv2';

const createApiLambdas = (stack: Stack, defaultApiEnvironment: Record<string, string>, triggerTopic: Topic, observabilityBucket: Bucket, webSocketApi: WebSocketApi) => {
  const { kickoffLambda } = createKickoffLambda(stack, defaultApiEnvironment);
  const { executionsLambda } = createExecutionsLambda(stack, defaultApiEnvironment);
  const { retryExecutionLambda } = createRetryExecutionLambda(stack, defaultApiEnvironment, triggerTopic, webSocketApi);
  const { triggerExecutionLambda } = createTriggerExecutionLambda(stack, defaultApiEnvironment, triggerTopic, webSocketApi);
  const { executionResultLambda } = createExecutionResultLambda(stack, defaultApiEnvironment);
  const { executionDetailsLambda } = createExecutionDetailsLambda(stack, defaultApiEnvironment, observabilityBucket);

  return { kickoffLambda, executionDetailsLambda, executionsLambda, triggerExecutionLambda, executionResultLambda, retryExecutionLambda };
};

export { createApiLambdas };
