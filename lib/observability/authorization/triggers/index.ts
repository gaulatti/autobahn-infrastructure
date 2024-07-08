import { Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Builds a pre-authentication trigger for the given stack.
 *
 * @param stack - The stack to associate the trigger with.
 * @returns The pre-authentication trigger handler.
 */
const buildPreAuthenticationTrigger = (stack: Stack) => {
  const handler = new NodejsFunction(stack, `${stack.stackName}PreAuthenticationTrigger`, {
    handler: 'preAuthentication',
    entry: './lib/observability/authorization/triggers/authentication.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
  });

  return handler;
};

/**
 * Builds and returns a post-authentication trigger handler.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns The post-authentication trigger handler.
 */
const buildPostAuthenticationTrigger = (stack: Stack) => {
  const handler = new NodejsFunction(stack, `${stack.stackName}PostAuthenticationTrigger`, {
    handler: 'postAuthentication',
    entry: './lib/observability/authorization/triggers/authentication.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
  });

  return handler;
};

export { buildPostAuthenticationTrigger, buildPreAuthenticationTrigger };
