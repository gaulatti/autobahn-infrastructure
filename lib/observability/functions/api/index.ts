import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
  createExecutionDetailsLambda,
  createExecutionsLambda,
  createRetryExecutionLambda,
  createTriggerExecutionLambda,
  createURLExecutionsLambda,
  createUrlStatsLambda,
  createExecutionJSONLambda,
} from './executions';
import { createKickoffLambda } from './kickoff';
import { WebSocketApi } from 'aws-cdk-lib/aws-apigatewayv2';

const createApiLambdas = (
  stack: Stack,
  defaultApiEnvironment: Record<string, string>,
  triggerTopic: Topic,
  observabilityBucket: Bucket,
  webSocketApi: WebSocketApi
) => {
  const { kickoffLambda } = createKickoffLambda(stack, defaultApiEnvironment);

  /**
   * Executions API.
   */
  const { executionsLambda } = createExecutionsLambda(stack, defaultApiEnvironment);
  const { retryExecutionLambda } = createRetryExecutionLambda(stack, defaultApiEnvironment, triggerTopic, webSocketApi);
  const { triggerExecutionLambda } = createTriggerExecutionLambda(stack, defaultApiEnvironment, triggerTopic, webSocketApi);
  const { executionDetailsLambda } = createExecutionDetailsLambda(stack, defaultApiEnvironment, observabilityBucket);
  const { executionJSONLambda } = createExecutionJSONLambda(stack, defaultApiEnvironment, observabilityBucket);

  /**
   * Stats API.
   */
  const { urlStatsLambda } = createUrlStatsLambda(stack, defaultApiEnvironment);
  const { urlExecutionsLambda } = createURLExecutionsLambda(stack, defaultApiEnvironment);

  return {
    kickoffLambda,
    executionDetailsLambda,
    executionsLambda,
    triggerExecutionLambda,
    retryExecutionLambda,
    urlStatsLambda,
    urlExecutionsLambda,
    executionJSONLambda
  };
};

export { createApiLambdas };
