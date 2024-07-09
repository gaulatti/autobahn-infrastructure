import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({});

let databaseCredentials: Record<string, string> | undefined;

const main = async (event: any) => {
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
};

export { main };
