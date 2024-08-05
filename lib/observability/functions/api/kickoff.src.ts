import { isWarmup } from '../../../common/utils';
import { buildCorsOutput, getCurrentUser } from '../../../common/utils/api';
import { ENUMS } from '../../../common/utils/consts';

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: AWSLambda.APIGatewayEvent) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  const { me } = await getCurrentUser(event);
  const output = { enums: ENUMS, me, features: [] };

  return buildCorsOutput(event, 200, output);
};

export { main };
