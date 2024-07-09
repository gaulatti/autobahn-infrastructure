import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
const lambdaClient = new LambdaClient();

const main = async (event: any) => {
  const { DATA_ACCESS_ARN } = process.env;

  const invokeCommand = new InvokeCommand({
    FunctionName: DATA_ACCESS_ARN,
    // payload here is the event on the other side.
    Payload: JSON.stringify(event),
  });

  try {
    const response = await lambdaClient.send(invokeCommand);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

export { main };
