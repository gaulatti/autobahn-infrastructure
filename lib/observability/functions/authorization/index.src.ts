import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { DalClient } from '../dal/client';
import { getCurrentUserBySub } from '../../../common/utils/api';

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
   * Retrieves the current user by the sub.
   */
  const { me }: { me: { sub: string } } = await getCurrentUserBySub(sub!);

  /**
   * If the user is not found, create the user.
   */
  if (!me.sub) {
    console.error(`User not found: ${email}. Creating.`);
    const createUser = await DalClient.createUser(sub!, email, given_name, family_name);
    console.log(`User created: ${JSON.stringify(createUser)}`);
  }

  callback(null, event);
};

export { preTokenGeneration };
