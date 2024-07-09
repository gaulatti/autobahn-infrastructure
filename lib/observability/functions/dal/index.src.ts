import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { AllowedRequest, CreateUserRequest, GetUserRequest, RequestType } from './types';

/**
 * This function retrieves the secret value from the Database secret.
 */
const client = new SecretsManagerClient({});
let databaseCredentials: Record<string, string> | undefined;

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
  }

  /**
   * Perform the operation based on the request type.
   */
  switch (request.type) {
    case RequestType.GetUser:
      console.log(request as GetUserRequest);
      break;
    case RequestType.CreateUser:
      console.log(request as CreateUserRequest);
      break;
    default:
      throw new Error('Invalid request type');
  }
};

export { main };
