import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Sequelize, Transaction } from 'sequelize';
import { isWarmup } from '../../../common/utils';
import { defineModels } from './entity';
import { executeOperation } from './operations';
import { AllowedRequest } from './types';

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
  const models = defineModels(sequelize);

  if (isWarmup(request)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  /**
   * Create a new transaction for the operation.
   */
  let transaction: Transaction = await sequelize.transaction();

  try {
    const result = await executeOperation(transaction, models, request);
    await transaction.commit();
    return result;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    console.error('Error performing operation:', error);
    throw error;
  }
};

export { main };
