import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../../common/utils/api';

/**
 * Creates the Executions Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @returns An object containing the `executionsLambda` function.
 */
const createExecutionsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const executionsLambda = new NodejsFunction(stack, `${stack.stackName}ExecutionsLambda`, {
    ...buildLambdaSpecs(stack, 'Executions', './lib/observability/functions/api/executions/list.src.ts', defaultApiEnvironment),
  });

  return { executionsLambda };
};

/**
 * Creates a trigger execution lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @returns An object containing the trigger execution lambda function.
 */
const createTriggerExecutionLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const triggerExecutionLambda = new NodejsFunction(stack, `${stack.stackName}TriggerExecutionLambda`, {
    ...buildLambdaSpecs(stack, 'TriggerExecution', './lib/observability/functions/api/executions/trigger.src.ts', defaultApiEnvironment),
  });

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
    ...buildLambdaSpecs(stack, 'ExecutionResult', './lib/observability/functions/api/executions/result.src.ts', defaultApiEnvironment),
  });

  return { executionResultLambda };
};

const createExecutionDetailsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const executionDetailsLambda = new NodejsFunction(stack, `${stack.stackName}ExecutionDetailsLambda`, {
    ...buildLambdaSpecs(stack, 'ExecutionDetails', './lib/observability/functions/api/executions/details.src.ts', defaultApiEnvironment),
  });

  return { executionDetailsLambda };
};

export { createExecutionResultLambda, createExecutionsLambda, createTriggerExecutionLambda, createExecutionDetailsLambda };

