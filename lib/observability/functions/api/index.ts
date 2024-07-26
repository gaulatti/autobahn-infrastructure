import { Stack } from 'aws-cdk-lib';
import { createExecutionResultLambda, createExecutionsLambda, createTriggerExecutionLambda, createExecutionDetailsLambda } from './executions';
import { createKickoffLambda } from './kickoff';

const createApiLambdas = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const { kickoffLambda } = createKickoffLambda(stack, defaultApiEnvironment);
  const { executionsLambda } = createExecutionsLambda(stack, defaultApiEnvironment);
  const { triggerExecutionLambda } = createTriggerExecutionLambda(stack, defaultApiEnvironment);
  const { executionResultLambda } = createExecutionResultLambda(stack, defaultApiEnvironment);
  const { executionDetailsLambda } = createExecutionDetailsLambda(stack, defaultApiEnvironment);

  return { kickoffLambda, executionDetailsLambda, executionsLambda, triggerExecutionLambda, executionResultLambda };
};

export { createApiLambdas };
