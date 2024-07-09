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
const createPreSignUpTrigger = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  /**
   * Creates a new pre-authentication trigger handler.
   */
  const preSignUpLambda = new NodejsFunction(stack, `${stack.stackName}PreAuthenticationTrigger`, {
    handler: 'preSignUp',
    entry: './lib/observability/functions/authorization/index.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    },
  });

  return { preSignUpLambda };
};

/**
 * Builds and returns a post-authentication trigger handler.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param dataAccessLambda - The data access lambda function.
 * @returns The post-authentication trigger handler.
 */
const createPostConfirmationTrigger = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  /**
   * Creates a new post-authentication trigger handler.
   */
  const postConfirmationLambda = new NodejsFunction(stack, `${stack.stackName}PostAuthenticationTrigger`, {
    handler: 'postConfirmation',
    entry: './lib/observability/functions/authorization/index.src.ts',
    runtime: Runtime.NODEJS_20_X,
    allowPublicSubnet: true,
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    },
  });

  return { postConfirmationLambda };
};

export { createPreSignUpTrigger, createPostConfirmationTrigger };
