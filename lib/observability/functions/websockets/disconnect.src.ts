import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log('Disconnect Event:', event);

  return {
    statusCode: 200,
    body: 'Disconnected',
  };
};

export { main };
