import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { GetUserRequest, RequestType } from '../dal/types';

const lambdaClient = new LambdaClient();

const main = async (event: any) => {
  const { DATA_ACCESS_ARN } = process.env;

  // TODO: Create type for this. It should come from GraphQL/Appsync with some user metadata.
  console.log({ event });

  const request: GetUserRequest = {
    type: RequestType.GetUser,
    userId: '123',
  };

  const invokeCommand = new InvokeCommand({
    FunctionName: DATA_ACCESS_ARN,
    Payload: JSON.stringify(request),
  });

  try {
    const response = await lambdaClient.send(invokeCommand);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

export { main };
