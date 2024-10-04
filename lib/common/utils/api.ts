import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Duration, Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import jwt from 'jsonwebtoken';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DalClient } from '../../observability/functions/dal/client';

/**
 * The DynamoDB client.
 */
const dynamodbClient = new DynamoDBClient();

/**
 * Checks if the event is a warmup event.
 *
 * @param event - The event object to check.
 * @returns True if the event is a warmup event, false otherwise.
 */
const isWarmup = (event: any) => event.source === 'cdk.schedule' && event.action === 'warmup';

/**
 * Builds the CORS output for an API Gateway event.
 * @param event - The APIGatewayEvent object.
 * @param statusCode - The HTTP status code.
 * @param output - The output data to be returned.
 * @returns The CORS output object.
 */
const buildCorsOutput = (event: AWSLambda.APIGatewayEvent, statusCode: number, output?: any) => {
  const allowedOrigins = ['http://localhost:5173', `https://${process.env.FRONTEND_FQDN}`];
  const origin = event.headers.origin || '';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  };

  /**
   * Hydrate the Trace ID
   */
  const traceId = event.headers['X-Amzn-Trace-Id'];
  output = {
    traceId,
    ...output,
  };

  return {
    statusCode,
    headers,
    body: JSON.stringify(output),
  };
};

/**
 * Retrieves the current user by their sub (subject) identifier.
 * @param sub - The sub identifier of the user.
 * @returns An object containing the user information.
 */
const getCurrentUserBySub = async (sub: string) => {
  const params = {
    TableName: process.env.CACHE_TABLE_NAME,
    Key: {
      sub: { S: sub },
      type: { S: 'kickoff' },
    },
  };

  const command = new GetItemCommand(params);
  const response = await dynamodbClient.send(command);
  const item = response.Item;

  if (!item) {
    const me = await DalClient.getUserBySubWithMembershipAndTeam(sub!.toString());

    if (!me) {
      return { me: null };
    }

    const putParams = {
      TableName: process.env.CACHE_TABLE_NAME,
      Item: marshall({
        type: 'kickoff',
        ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
        ...me,
      }),
    };

    await dynamodbClient.send(new PutItemCommand(putParams));
    return { me };
  }

  return { me: unmarshall(item) };
};

/**
 * Extracts the current user's subject (sub) from the provided API Gateway event.
 *
 * @param event - The API Gateway event containing the authorization header.
 * @returns A promise that resolves to the subject (sub) of the current user.
 *
 * @throws Will throw an error if the authorization header is missing or malformed.
 */
const getCurrentSubFromEvent = (event: AWSLambda.APIGatewayEvent) => {
  const token = event.headers.Authorization!.split(' ')[1];
  const { sub } = jwt.decode(token, { json: true })!;

  if (!sub) {
    throw new Error('Sub not found');
  }

  return sub;
};

/**
 * Builds the specifications for a Lambda function.
 *
 * @param stack - The stack object.
 * @param name - The name of the Lambda function.
 * @param entry - The entry point file for the Lambda function.
 * @param environment - The environment variables for the Lambda function.
 * @returns The specifications for the Lambda function.
 */
const buildLambdaSpecs = (stack: Stack, name: string, entry: string, environment: Record<string, string>) => ({
  functionName: `${stack.stackName}${name}`,
  entry,
  handler: 'main',
  runtime: Runtime.NODEJS_20_X,
  timeout: Duration.minutes(1),
  environment,
  memorySize: 1024,
});

/**
 * Wraps a function with CORS handling logic.
 *
 * @template T - The type of the wrapped function.
 * @param {T} fn - The function to be wrapped.
 * @returns {T} - The wrapped function.
 */
const HandleCorsOutput = <T extends (event: AWSLambda.APIGatewayEvent) => Promise<any>>(fn: T): T => {
  return async function (event: AWSLambda.APIGatewayEvent): Promise<ReturnType<T>> {
    try {
      const output = await fn(event);
      return buildCorsOutput(event, 200, output) as ReturnType<T>;
    } catch (error: any) {
      console.error('Error occurred:', error);
      return buildCorsOutput(event, 500) as ReturnType<T>;
    }
  } as T;
};

/**
 * Decorator that logs the execution time of a function.
 *
 * @template T - The type of the decorated function.
 * @param {T} fn - The function to be decorated.
 * @returns {T} - The decorated function.
 */
const LogExecutionTime = <T extends (event: AWSLambda.APIGatewayEvent) => Promise<any>>(fn: T): T => {
  return async function (event: AWSLambda.APIGatewayEvent): Promise<ReturnType<T>> {
    const start = performance.now();
    const result = await fn(event);
    const end = performance.now();
    console.log(`Execution time: ${end - start}ms`);
    return result;
  } as T;
};

/**
 * Decorator function that logs the details of an APIGatewayEvent before and after invoking the decorated function.
 * @param fn - The function to be decorated.
 * @returns A decorated function that logs the event details and invokes the original function.
 * @template T - The type of the original function.
 */
const LogArguments = <T extends (event: AWSLambda.APIGatewayEvent) => Promise<any>>(fn: T): T => {
  return async function (event: AWSLambda.APIGatewayEvent): Promise<ReturnType<T>> {
    console.log('Event details:', event);
    const result = await fn(event);
    return result;
  } as T;
};

/**
 * Wraps a Lambda function to handle warmup events.
 *
 * @template T - The type of the wrapped Lambda function.
 * @param {T} fn - The Lambda function to be wrapped.
 * @returns {T} - The wrapped Lambda function.
 */
const HandleWarmup = <T extends (event: AWSLambda.APIGatewayEvent) => Promise<any>>(fn: T): T => {
  return async function (event: AWSLambda.APIGatewayEvent): Promise<ReturnType<T>> {
    if (isWarmup(event)) {
      return {} as ReturnType<T>;
    }
    return fn(event);
  } as T;
};

/**
 * Wraps the provided function with middleware for handling delivery of API Gateway events.
 *
 * @template T - The type of the provided function.
 * @param {T} fn - The function to be wrapped.
 * @returns {T} - The wrapped function.
 */
const HandleDelivery = <T extends (event: AWSLambda.APIGatewayEvent) => Promise<any>>(fn: T): T => {
  return HandleWarmup(LogArguments(LogExecutionTime(HandleCorsOutput(fn))));
};

export { buildCorsOutput, buildLambdaSpecs, getCurrentSubFromEvent, getCurrentUserBySub, isWarmup, HandleDelivery };