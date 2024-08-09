import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { Duration, Stack } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import jwt from 'jsonwebtoken';
import { isWarmup } from '.';

/**
 * Represents a decoder for decoding binary data.
 */
const decoder = new TextDecoder('utf-8');

/**
 * Represents a client for interacting with the Lambda service.
 */
const lambdaClient = new LambdaClient();

/**
 * Retrieves the current user by their sub (subject) identifier.
 * @param sub - The sub identifier of the user.
 * @returns An object containing the user information.
 */
const getCurrentUserBySub = async (sub: string) => {
  const invokeCommand = new InvokeCommand({
    FunctionName: process.env.KICKOFF_CACHE_ARN,
    Payload: JSON.stringify({ sub }),
  });

  const { Payload } = await lambdaClient.send(invokeCommand);
  const me = JSON.parse(decoder.decode(Payload));

  return { me };
};

/**
 * Retrieves the current user information.
 *
 * @param event - The APIGatewayEvent object containing the request information.
 * @returns An object containing the current user information.
 */
const getCurrentUser = async (event: AWSLambda.APIGatewayEvent) => {
  const token = event.headers.Authorization!.split(' ')[1];
  const {
    payload: { sub },
  } = jwt.decode(token, { complete: true })!;

  return getCurrentUserBySub(sub!.toString());
};

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

export { buildLambdaSpecs, getCurrentUser, getCurrentUserBySub, HandleDelivery };
