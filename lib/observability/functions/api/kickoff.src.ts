import { getCurrentSubFromEvent, getCurrentUserBySub, HandleDelivery } from '../../../common/utils/api';
import { ENUMS } from '../../../common/utils/consts';
import { DalClient } from '../dal/client';

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  /**
   * Retrieve the current user.
   */
  const sub = getCurrentSubFromEvent(event);
  let { me } = await getCurrentUserBySub(sub);

  /**
   * If the user is not found, create the user.
   */
  if (!me?.sub) {
    console.error(`User not found: ${sub}. Creating.`);

    /**
     * Create the user.
     */
    me = await DalClient.createUser(sub);

    /**
     * Retrieve the Base Team.
     *
     * By now this is Site Performance.
     *
     * However, in the future we can restrict membership to this team
     * and create a more "public" team where the rest of CNN/WBD can join.
     */
    const baseTeam = await DalClient.getTeam(1);

    /**
     * Create the user as member for the Base Team with the role of Member.
     */
    await DalClient.createMembership(me.id, baseTeam.id, 2);

    /**
     * Re-getting the user in the shape required by the frontend.
     */
    me = (await getCurrentUserBySub(sub)).me;
  }

  return { enums: ENUMS, me, features: [] };
});

export { main };
