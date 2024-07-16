import { DalClient } from '../dal/client';

/**
 * The main function for the assignment type.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the assignment information.
 */
const main = async (event: { field: string; source: any; sub: string; arguments: Record<string, string>; parentType: string }) => {
  const { field, source } = event;

    switch (field) {
      case 'project':
      return { project: await DalClient.getProject(source.id) };

      default:
        throw new Error(`Unknown field: ${field}`);
    }
};

export { main };
