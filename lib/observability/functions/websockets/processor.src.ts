import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

let apiGatewayManagementApiClient: ApiGatewayManagementApiClient;

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: `https://${event.requestContext.domainName!}/prod`,
    });
  }

  const { connectionId } = event.requestContext;
  const message = event.body ? JSON.parse(event.body).message : 'Hello from server!';

  const params = {
    ConnectionId: connectionId,
    Data: Buffer.from(message),
  };

  try {
    await apiGatewayManagementApiClient.send(new PostToConnectionCommand(params));
    return {
      statusCode: 200,
      body: 'Message sent',
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Failed to send message: ' + JSON.stringify(error),
    };
  }
};

export { main };
