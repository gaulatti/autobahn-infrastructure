import { APIGatewayEvent } from 'aws-lambda';

const main = (event: APIGatewayEvent) => {
  console.log(event);
  return {
    statusCode: 200,
    body: 'Authorized',
  };
};

export { main };
