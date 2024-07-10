import { InvokeCommand, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import { AllowedRequest, GetUserRequest, RequestType } from './types';

/**
 * Represents a client for interacting with the Lambda service.
 */
const lambdaClient = new LambdaClient();

/**
 * Represents a decoder for decoding binary data.
 */
const decoder = new TextDecoder('utf-8');

/**
 * Represents a client for interacting with the data access layer.
 */
class DalClient {
  /**
   * Invokes a Lambda function with the given request.
   * @param request The request to send to the Lambda function.
   * @returns The response from the Lambda function.
   */
  private static async invoke(request: AllowedRequest): Promise<InvokeCommandOutput> {
    const invokeCommand = new InvokeCommand({
      FunctionName: process.env.DATA_ACCESS_ARN,
      Payload: JSON.stringify(request),
    });
    return await lambdaClient.send(invokeCommand);
  }

  /**
   * Parses the payload received as a Uint8Array and returns the parsed JSON object.
   *
   * @param payload - The payload to be parsed.
   * @returns The parsed JSON object.
   */
  private static parsePayload(payload: Uint8Array) {
    const responsePayload = decoder.decode(payload);
    return JSON.parse(responsePayload);
  }

  /**
   * Invokes the DalClient with the provided request and returns the parsed payload.
   * @param request The request to be invoked.
   * @returns The parsed payload.
   */
  private static async parsedInvoke(request: AllowedRequest) {
    const { Payload } = await DalClient.invoke(request);
    return DalClient.parsePayload(Payload!);
  }

  /**
   * Gets a user by their ID.
   * @param userId The ID of the user to get.
   * @returns The user with the given ID.
   */
  public static async getUser(id: number) {
    const request: GetUserRequest = {
      type: RequestType.GetUser,
      id,
    };

    return await DalClient.parsedInvoke(request);
  }
}

export { DalClient };
