import { buildCorsOutput, getCurrentUser } from '../../../common/utils/api';
import { ENUMS } from '../../../common/utils/consts';

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: AWSLambda.APIGatewayEvent) => {
  const { me } = await getCurrentUser(event);
  const output = { enums: ENUMS, me, features: [] };

  return buildCorsOutput(event, 200, output)
};

export { main };
