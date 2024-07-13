import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { AllowedRequest, CreateUserRequest, GetUserRequest, RequestType } from './types';
import { Sequelize } from 'sequelize';
import { defineModels } from './entity';

/**
 * This function retrieves the secret value from the Database secret.
 */
const client = new SecretsManagerClient({});
let databaseCredentials: Record<string, string>;
let sequelize: Sequelize;

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
  const { User, Team, Project, Target, PerformanceExecution, Schedule, PerformanceStatistic, BounceStatistic, Assignment, Beacon, Engagement } =
    defineModels(sequelize);

  /**
   * Perform the operation based on the request type.
   */
  switch (request.type) {
    case RequestType.GetUser:
      const user = await User.findOne({ where: { id: (request as GetUserRequest).id } });
      return JSON.stringify(user);
    case RequestType.CreateUser:
      console.log(request as CreateUserRequest);
      return JSON.stringify({ userId: 123, name: 'Alice' });
    default:
      throw new Error('Invalid request type');
  }
};

export { main };
