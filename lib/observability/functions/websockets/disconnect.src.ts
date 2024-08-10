import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const { connectionId } = event.requestContext;

  console.log(`Tschuss ${connectionId}`, event);

  return {
    statusCode: 200,
    body: 'Disconnected',
  };
};

export { main };
