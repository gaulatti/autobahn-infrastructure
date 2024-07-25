import { ENUMS } from '../../../common/utils/consts';
import jwt from 'jsonwebtoken';
import { DalClient } from '../dal/client';
/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: AWSLambda.APIGatewayEvent) => {
  // TODO: Move this to a common util function.
  const token = event.headers.Authorization!.split(' ')[1];
  const {
    payload: { sub },
  } = jwt.decode(token, { complete: true })!;

  // TODO: Move this to a common util function.
  const allowedOrigins = ['http://localhost:5173', `https://${process.env.FRONTEND_FQDN}`];
  const origin = event.headers.origin || '';
  const me = await DalClient.getUserBySubWithMembershipAndTeam(sub!.toString());

  const output = {
    enums: ENUMS,
    me,
    features: []
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    },
    body: JSON.stringify(output),
  };
};

export { main };
