import { DalClient } from '../dal/client';

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: { field: string; sub: string; arguments: Record<string, string> }) => {
    const { field, sub } = event;

    switch (field) {
      /**
       * Declare the kickoff object with ENUM data.
       */
      case 'kickoff':
        return { kickoff: {} };

      /**
       * Get the user by their sub.
       */
      case 'me':
        return { me: await DalClient.getUserBySub(sub) };

      /**
       * Get the teams for the user.
       */
      case 'teams':
        return { teams: await DalClient.listTeamsBySub(sub) };

      /**
       * Get the feature flags for the user.
       */
      case 'features':
        return {
          features: await DalClient.listFeaturesBySub(sub),
        };

      default:
        throw new Error(`Unknown field: ${field}`);
    }
};

export { main };
