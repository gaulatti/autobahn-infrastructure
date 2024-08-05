import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log('Connect Event:', event);

  return {
    statusCode: 200,
    body: 'Connected',
  };
};

export { main };
