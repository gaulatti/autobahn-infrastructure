import { Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Builds a pre-authentication trigger for the given stack.
 *
 * @param stack - The stack to associate the trigger with.
 * @param dataAccessLambda - The data access lambda function.
 * @returns The pre-authentication trigger handler.
 */
const createPreAuthenticationTrigger = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  /**
   * Creates a new pre-authentication trigger handler.
   */
  const preAuthenticationLambda = new NodejsFunction(stack, `${stack.stackName}PreAuthenticationTrigger`, {
    handler: 'preAuthentication',
    entry: './lib/observability/authorization/triggers/authentication.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    },
  });

  return { preAuthenticationLambda };
};

/**
 * Builds and returns a post-authentication trigger handler.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param dataAccessLambda - The data access lambda function.
 * @returns The post-authentication trigger handler.
 */
const createPostAuthenticationTrigger = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  /**
   * Creates a new post-authentication trigger handler.
   */
  const postAuthenticationLambda = new NodejsFunction(stack, `${stack.stackName}PostAuthenticationTrigger`, {
    handler: 'postAuthentication',
    entry: './lib/observability/authorization/triggers/authentication.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    },
  });

  return { postAuthenticationLambda };
};

export { createPostAuthenticationTrigger, createPreAuthenticationTrigger };
