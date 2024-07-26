import { buildCorsOutput, getCurrentUser } from '../../../../common/utils/api';

const main = async (event: AWSLambda.APIGatewayEvent) => {
  console.log(JSON.stringify(event));
  const { me } = await getCurrentUser(event);

  const output = { lala: 'po'};

  return buildCorsOutput(event, 200, output);
};

export { main };
