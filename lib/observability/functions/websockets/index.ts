import { Duration, Stack } from 'aws-cdk-lib';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates a connect lambda function.
 *
 * @param stack - The stack object.
 * @returns An object containing the connect lambda function.
 */
const createConnectLambda = (stack: Stack, environment: Record<string, string>, cacheTable: Table) => {
  const connectLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsConnectLambda`, {
    functionName: `${stack.stackName}WebSocketsConnect`,
    entry: './lib/observability/functions/websockets/connect.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      CACHE_TABLE_NAME: cacheTable.tableName,
      ...environment
    },
  });

  return { connectLambda };
};

/**
 * Creates a disconnect Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the disconnect Lambda function.
 */
const createDisconnectLambda = (stack: Stack, environment: Record<string, string>, cacheTable: Table) => {
  const disconnectLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsDisconnectLambda`, {
    functionName: `${stack.stackName}WebSocketsDisconnect`,
    entry: './lib/observability/functions/websockets/disconnect.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      CACHE_TABLE_NAME: cacheTable.tableName,
      ...environment
    },
  });

  return { disconnectLambda };
};

/**
 * Creates a log processor Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the log processor Lambda function.
 */
const createLogProcessorLambda = (stack: Stack, environment: Record<string, string>, cacheTable: Table) => {
  const logProcessorLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsLogProcessorLambda`, {
    functionName: `${stack.stackName}WebSocketsLogProcessor`,
    entry: './lib/observability/functions/websockets/processor.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      CACHE_TABLE_NAME: cacheTable.tableName,
      ...environment
    },
  });

  return { logProcessorLambda };
};

/**
 * Creates an authorizer Lambda function for WebSocket connections.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the authorizer Lambda function.
 */
const createAuthorizerLambda = (stack: Stack, userPool: UserPool) => {
  const authorizerLambda = new NodejsFunction(stack, `${stack.stackName}WebSocketsAuthorizerLambda`, {
    functionName: `${stack.stackName}WebSocketsAuthorizer`,
    entry: './lib/observability/functions/websockets/authorizer.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      COGNITO_USER_POOL_ID: userPool.userPoolId,
      COGNITO_USER_POOL_REGION: stack.region,
    },
  });

  return { authorizerLambda };
};

/**
 * Creates WebSocket lambdas.
 *
 * @param stack - The stack object.
 * @param defaultApiEnvironment - The default API environment.
 * @param userPool - The user pool object.
 * @returns An object containing the created WebSocket lambdas.
 */
const createWebSocketLambdas = (stack: Stack, defaultApiEnvironment: Record<string, string>, userPool: UserPool, cacheTable: Table) => {
  const { authorizerLambda } = createAuthorizerLambda(stack, userPool);
  const { connectLambda } = createConnectLambda(stack, defaultApiEnvironment, cacheTable);
  const { disconnectLambda } = createDisconnectLambda(stack, defaultApiEnvironment, cacheTable);
  const { logProcessorLambda } = createLogProcessorLambda(stack, defaultApiEnvironment, cacheTable);

  return { authorizerLambda, connectLambda, disconnectLambda, logProcessorLambda };
};

export { createWebSocketLambdas };
