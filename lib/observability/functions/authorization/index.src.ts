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

const preSignUp = async (event: CognitoTriggerEvent, context: any, callback: any) => {
  const {
    userName,
    request: {
      userAttributes: { sub, given_name, family_name, email },
    },
  } = event;

  const { DATA_ACCESS_ARN } = process.env;
  console.log({ userName, sub, given_name, family_name, email, DATA_ACCESS_ARN });
  callback(null, event);
};

const postConfirmation = async (event: CognitoTriggerEvent, context: any, callback: any) => {
  console.log(event);
  callback(null, event);
};

export { postConfirmation, preSignUp };
