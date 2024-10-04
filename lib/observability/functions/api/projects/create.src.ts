import { randomUUID } from 'crypto';
import { DalClient } from '../../dal/client';
import { HandleDelivery } from '../../../../common/utils/api';

/**
 * Main handler for creating a project.
 *
 * This function handles the delivery of an API Gateway event to create a new project.
 * It extracts the team and project name from the request body, fetches the team record,
 * generates a UUID for the project, and creates the project in the database.
 *
 * @param {AWSLambda.APIGatewayEvent} event - The API Gateway event containing the request data.
 * @returns {Promise<any>} - A promise that resolves to the created project record.
 */
const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  /**
   * Extract the target from the request body.
   */
  const { team, name } = JSON.parse(event.body!);

  /**
   * Fetch the URL record.
   */
  let teamRecord = await DalClient.getTeam(parseInt(team));

  /**
   * Generate a UUID for the project.
   */
  const uuid = randomUUID();

  /**
   * Create the target. By now only URL-based targets are supported.
   */
  const record = await DalClient.createProject(teamRecord.id, name, uuid);

  return record;
});

export { main };
