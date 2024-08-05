import { Duration, Stack } from 'aws-cdk-lib';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates a connect lambda function.
 *
 * @param stack - The stack object.
 * @returns An object containing the connect lambda function.
 */
const createConnectLambda = (stack: Stack) => {
  const connectLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsConnectLambda`, {
    functionName: `${stack.stackName}WebSocketsConnect`,
    entry: './lib/observability/functions/websockets/connect.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
  });

  return { connectLambda };
};

/**
 * Creates a disconnect Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the disconnect Lambda function.
 */
const createDisconnectLambda = (stack: Stack) => {
  const disconnectLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsDisconnectLambda`, {
    functionName: `${stack.stackName}WebSocketsDisconnect`,
    entry: './lib/observability/functions/websockets/disconnect.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
  });

  return { disconnectLambda };
};

/**
 * Creates a log processor Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the log processor Lambda function.
 */
const createLogProcessorLambda = (stack: Stack) => {
  const logProcessorLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsLogProcessorLambda`, {
    functionName: `${stack.stackName}WebSocketsLogProcessor`,
    entry: './lib/observability/functions/websockets/processor.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
  });

  return { logProcessorLambda };
};

/**
 * Creates an authorizer Lambda function for WebSocket connections.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the authorizer Lambda function.
 */
const createAuthorizerLambda = (stack: Stack) => {
  const authorizerLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsAuthorizerLambda`, {
    functionName: `${stack.stackName}WebSocketsAuthorizer`,
    entry: './lib/observability/functions/websockets/authorizer.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
  });

  return { authorizerLambda };
};

export { createAuthorizerLambda, createLogProcessorLambda, createConnectLambda, createDisconnectLambda };
