import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const { connectionId } = event.requestContext;

  console.log(`Wilkommen ${connectionId}`, event);

  return {
    statusCode: 200,
    body: 'Connected',
  };
};

export { main };
