import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { AllowedRequest, CreateUserRequest, GetUserByEmailRequest, GetUserRequest, RequestType } from './types';
import { Sequelize } from 'sequelize';
import { defineModels } from './entity';

/**
 * This function retrieves the secret value from the Database secret.
 */
const client = new SecretsManagerClient({});
let databaseCredentials: Record<string, string>;
let sequelize: Sequelize;

/**
 * Prepares the output by converting it to a JSON string if it exists.
 * @param input - The input promise.
 * @returns A JSON string representation of the output if it exists, otherwise null.
 */
const prepareOutput = async (input: Promise<any>) => {
  const output = await input;
  if (output) {
    return JSON.stringify(output);
  }

  return null;
};

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
  const { User, Team, Project, Target, PerformanceExecution, Schedule, PerformanceStatistic, BounceStatistic, Assignment, Beacon, Engagement } =
    defineModels(sequelize);

  /**
   * Perform the operation based on the request type.
   */
  switch (request.type) {
    case RequestType.GetUser:
      return prepareOutput(User.findOne({ where: { id: (request as GetUserRequest).id } }));
    case RequestType.ListUsers:
      return prepareOutput(User.findAll());
    case RequestType.GetUserByEmail:
      return prepareOutput(User.findOne({ where: { email: (request as GetUserByEmailRequest).email } }));
    case RequestType.CreateUser:
      return prepareOutput(User.create({ ...request, created_at: new Date(), updated_at: new Date() }));
    default:
      throw new Error('Invalid request type');
  }
};

export { main };
