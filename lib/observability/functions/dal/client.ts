import { InvokeCommand, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import { AllowedRequest, CreateUserRequest, GetUserRequest, RequestType } from './types';

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
  public static async getUser(payload: number) {
    const request: GetUserRequest = {
      type: RequestType.GetUser,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Gets a user by their sub.
   * @param userId The sub of the user to get.
   * @returns The user with the given sub.
   */
  public static async getUserBySub(payload: string) {
    const request: GetUserRequest = {
      type: RequestType.GetUserBySub,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Retrieves a user by their email address.
   * @param email - The email address of the user.
   * @returns A promise that resolves to the user object.
   */
  public static async getUserByEmail(payload: string) {
    const request: GetUserRequest = {
      type: RequestType.GetUserByEmail,
      payload,
    };

    return await DalClient.parsedInvoke(request);
  }

  /**
   * Creates a new user with the provided information.
   * @param sub - The user's sub.
   * @param email - The user's email.
   * @param name - The user's name.
   * @param last_name - The user's last name.
   * @returns A promise that resolves to the result of the create user operation.
   */
  public static async createUser(sub: string, email: string, name: string, last_name: string) {
    const request: CreateUserRequest = {
      type: RequestType.CreateUser,
      sub,
      email,
      name,
      last_name,
    };

    return await DalClient.parsedInvoke(request);
  }
}

export { DalClient };
