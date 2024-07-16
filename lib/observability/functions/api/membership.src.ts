import { DalClient } from '../dal/client';

/**
 * The main function for the membership type.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the membership information.
 */
const main = async (event: { field: string; source: any; sub: string; arguments: Record<string, string>; parentType: string }) => {
  const { field, source } = event;

  switch (field) {
    case 'team':
      return { team: await DalClient.getTeam(source.id) };

    case 'assignments':
      return { assignments: await DalClient.listAssignmentsByMembership(source.id) };

    default:
      throw new Error(`Unknown field: ${field}`);
  }
};

export { main };
