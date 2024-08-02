import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../common/utils/api';
import { Tracing } from 'aws-cdk-lib/aws-lambda';

/**
 * Creates the Kickoff Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @returns An object containing the `kickoffLambda` function.
 */
const createKickoffLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const kickoffLambda = new NodejsFunction(stack, `${stack.stackName}KickoffLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'Kickoff', './lib/observability/functions/api/kickoff.src.ts', defaultApiEnvironment),
  });

  return { kickoffLambda };
};

export { createKickoffLambda };
