import { getCurrentUser, HandleDelivery } from '../../../common/utils/api';
import { ENUMS } from '../../../common/utils/consts';

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { me } = await getCurrentUser(event);
  const output = { enums: ENUMS, me, features: [] };

  return output;
});

export { main };
