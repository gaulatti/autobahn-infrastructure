import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import jwt from 'jsonwebtoken';

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
const buildCorsOutput = (event: AWSLambda.APIGatewayEvent, statusCode: number, output: unknown) => {
  const allowedOrigins = ['http://localhost:5173', `https://${process.env.FRONTEND_FQDN}`];
  const origin = event.headers.origin || '';

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    },
    body: JSON.stringify(output),
  };
};

export { buildCorsOutput, getCurrentUser, getCurrentUserBySub };
