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

const preTokenGeneration = async (event: CognitoTriggerEvent, context: any, callback: any) => {
  const {
    userName,
    request: {
      userAttributes: { sub, given_name, family_name, email },
    },
  } = event;

  const response = await DalClient.getUserByEmail(email);
  console.log({ response });

  callback(null, event);
};

export { preTokenGeneration };
