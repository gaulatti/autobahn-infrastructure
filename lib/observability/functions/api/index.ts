import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { createExecutionDetailsLambda, createExecutionResultLambda, createExecutionsLambda, createTriggerExecutionLambda } from './executions';
import { createKickoffLambda } from './kickoff';

const createApiLambdas = (stack: Stack, defaultApiEnvironment: Record<string, string>, triggerTopic: Topic, observabilityBucket: Bucket) => {
  const { kickoffLambda } = createKickoffLambda(stack, defaultApiEnvironment);
  const { executionsLambda } = createExecutionsLambda(stack, defaultApiEnvironment);
  const { triggerExecutionLambda } = createTriggerExecutionLambda(stack, defaultApiEnvironment, triggerTopic);
  const { executionResultLambda } = createExecutionResultLambda(stack, defaultApiEnvironment);
  const { executionDetailsLambda } = createExecutionDetailsLambda(stack, defaultApiEnvironment, observabilityBucket);

  return { kickoffLambda, executionDetailsLambda, executionsLambda, triggerExecutionLambda, executionResultLambda };
};

export { createApiLambdas };
