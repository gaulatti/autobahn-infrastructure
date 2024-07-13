import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Sequelize } from 'sequelize';
import { defineModels } from './entity';
import { AllowedRequest, GetUserRequest, RequestType } from './types';

/**
 * This function retrieves the secret value from the Database secret.
 */
const client = new SecretsManagerClient({});
let databaseCredentials: Record<string, string>;
let sequelize: Sequelize;

/**
 * The main function that handles the request and performs the database operations.
 *
 * @param request - The request object containing the type and necessary parameters.
 * @returns A promise that resolves to the result of the database operation.
 * @throws An error if the request type is invalid or if there is an error retrieving the secret.
 */
const main = async (request: AllowedRequest) => {
  try {
    /**
     * Retrieve the secret value from the Database secret.
     */
    if (!databaseCredentials) {
      const command = new GetSecretValueCommand({ SecretId: process.env.DATABASE_SECRET });
      const response = await client.send(command);
      databaseCredentials = JSON.parse(response.SecretString!);
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }

  /**
   * Create a new Sequelize instance if one does not exist.
   */
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_NAME!, databaseCredentials.username, databaseCredentials.password, {
      host: process.env.DATABASE_FQDN!,
      dialect: 'mysql',
      pool: {
        max: 2,
        min: 0,
        idle: 0,
        acquire: 3000,
        evict: 60000,
      },
    });
  }

  /**
   * Define the models for the database.
   */
  const { User, Team, Project, Target, Schedule, Assignment, Beacon, Engagement } = defineModels(sequelize);

  /**
   * Perform the operation based on the request type.
   */
  switch (request.type) {
    case RequestType.GetUser:
      return User.findOne({ where: { id: (request as GetUserRequest).payload } });
    case RequestType.GetUserByEmail:
      return User.findOne({ where: { email: (request as GetUserRequest).payload } });
    case RequestType.GetUserBySub:
      return User.findOne({ where: { sub: (request as GetUserRequest).payload } });
    case RequestType.ListUsers:
      return User.findAll();
    case RequestType.CreateUser:
      return User.create({ ...request });
    default:
      throw new Error('Invalid request type');
  }
};

export { main };
