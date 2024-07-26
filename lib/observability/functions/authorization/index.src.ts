import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { DalClient } from '../dal/client';

interface CognitoTriggerEvent {
  version: string;
  region: string;
  userPoolId: string;
  userName: string;
  callerContext: {
    awsSdkVersion: string;
    clientId: string;
  };
  triggerSource: string;
  request: {
    userAttributes: {
      sub?: string;
      email_verified: string;
      identities?: string;
      'cognito:email_alias'?: string;
      'cognito:phone_number_alias'?: string;
      'cognito:user_status'?: string;
      given_name: string;
      family_name: string;
      email: string;
    };
    validationData?: Record<string, unknown>;
  };
  response: {
    autoConfirmUser?: boolean;
    autoVerifyEmail?: boolean;
    autoVerifyPhone?: boolean;
  };
}

/**
 * Represents a decoder for decoding binary data.
 */
const decoder = new TextDecoder('utf-8');

/**
 * Represents a client for interacting with the Lambda service.
 */
const lambdaClient = new LambdaClient();

/**
 * Handles the pre-token generation Cognito trigger event.
 *
 * @param event - The Cognito trigger event.
 * @param context - The execution context.
 * @param callback - The callback function to be called when the operation is complete.
 */
const preTokenGeneration = async (event: CognitoTriggerEvent, context: any, callback: any) => {
  const {
    request: {
      userAttributes: { sub, given_name, family_name, email },
    },
  } = event;

  /**
   * Get the user by email. Create if it does not exist.
   */
  const invokeCommand = new InvokeCommand({
    FunctionName: process.env.KICKOFF_CACHE_ARN,
    Payload: JSON.stringify({ sub }),
  });

  const { Payload } = await lambdaClient.send(invokeCommand);
  const me = JSON.parse(decoder.decode(Payload));

  if (!me) {
    console.error(`User not found: ${email}. Creating.`);
    const createUser = await DalClient.createUser(sub!, email, given_name, family_name);
    console.log(`User created: ${JSON.stringify(createUser)}`);
  }

  callback(null, event);
};

export { preTokenGeneration };
