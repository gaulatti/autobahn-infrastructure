import { Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Builds and returns a pre-authentication trigger handler.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param dataAccessLambda - The data access lambda function.
 * @returns The pre-authentication trigger handler.
 */
const createPreTokenGenerationTrigger = (stack: Stack, dataAccessLambda: NodejsFunction, kickoffCacheLambda: NodejsFunction) => {
  /**
   * Creates a new pre-authentication trigger handler.
   */
  const preTokenGenerationLambda = new NodejsFunction(stack, `${stack.stackName}PreTokenGeneration`, {
    handler: 'preTokenGeneration',
    functionName: `${stack.stackName}PreTokenGeneration`,
    entry: './lib/observability/functions/authorization/index.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      KICKOFF_CACHE_ARN: kickoffCacheLambda.functionArn,
    },
  });

  dataAccessLambda.grantInvoke(preTokenGenerationLambda);
  kickoffCacheLambda.grantInvoke(preTokenGenerationLambda);

  return { preTokenGenerationLambda };
};


export { createPreTokenGenerationTrigger };
