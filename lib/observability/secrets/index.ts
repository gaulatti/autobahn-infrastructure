import { Stack } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

/**
 * Creates secrets for the specified stack.
 *
 * @param stack - The stack to create the secrets for.
 * @returns An object containing the created secrets.
 */
const createSecrets = (stack: Stack) => {
  /**
   * The secret containing the certificate ARN.
   */
  const certificateArnSecret = new Secret(stack, `${stack.stackName}CertificateArnSecret`);

  /**
   * The secret containing the GitHub token.
   */
  const githubTokenSecret = new Secret(stack, `${stack.stackName}GithubTokenSecret`);

  /**
   * The secret containing the frontend FQDN.
   */
  const frontendFqdnSecret = new Secret(stack, `${stack.stackName}FrontendFQDNSecret`);

  /**
   * Return the created secrets.
   */
  return { certificateArnSecret, githubTokenSecret, frontendFqdnSecret };
};

export { createSecrets };
