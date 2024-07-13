import { DalClient } from '../dal/client';

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: { field: string; sub: string; arguments: Record<string, string> }) => {
  const { sub } = event;

  /**
   * Get the user by their sub.
   */
  const me = await DalClient.getUserBySub(sub);

  /**
   * Return the kickoff information.
   */
  return { kickoff: { me } };
};

export { main };
