import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { isWarmup } from '../../../common/utils';

let apiGatewayManagementApiClient: ApiGatewayManagementApiClient;

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return { statusCode: 200, body: 'warmup' };
  }
  const { connectionId, domainName } = event.requestContext;

  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: `https://${domainName}/prod`,
    });
  }

  try {
    /**
     * Do any operation with the message coming from the wire.
     *
     * If we need to post a message, we can do:
     * const params = {
     *  ConnectionId: connectionId,
     *  Data: Buffer.from(message),
     * }
     *
     * await apiGatewayManagementApiClient.send(new PostToConnectionCommand(params));
     *
     * { message } must be a valid serializable object.
     */

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
