import { Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { createCognitoAuth } from './authorization';
import { createBuildProject } from './build';
import { createDashboard } from './dashboard';
import { createDataAccessLambda } from './functions/dal';
import { createProcessingLambda } from './functions/processing';
import { createPreTokenGenerationTrigger } from './functions/authorization';
import { createDistribution } from './network';
import { createBuckets } from './storage';
import { createKickoffLambda } from './functions/kickoff';

const createObservabilityInfrastructure = (stack: Stack) => {
  /**
   * Storage (S3)
   */
  const { observabilityBucket, frontendBucket } = createBuckets(stack);

  /**
   * Lambdas
   */
  const { dataAccessLambda } = createDataAccessLambda(stack);
  const { processingLambda } = createProcessingLambda(stack, observabilityBucket, dataAccessLambda);
  const { preTokenGenerationLambda } = createPreTokenGenerationTrigger(stack, dataAccessLambda);
  const { kickoffLambda } = createKickoffLambda(stack, dataAccessLambda);

  /**
   * Dashboard
   */
  const { dashboard } = createDashboard(stack);

  /**
   * Important: For the following code snippets to work, the following
   * values must be set in the environment variables:
   *
   * - CERTIFICATE_ARN: The ARN of the certificate to use for the frontend distribution.
   * - FRONTEND_FQDN: The fully qualified domain name (FQDN) of the frontend website.
   * - DATABASE_SECRET_ARN: The ARN of the secret containing the database credentials.
   * - DATABASE_FQDN: The fully qualified domain name (FQDN) of the database.
   *
   * Plus, GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for
   * the Google Identity Provider (required in createCognitoAuth function)
   */
  const requiredEnvVariables = ['CERTIFICATE_ARN', 'FRONTEND_FQDN', 'DATABASE_SECRET_ARN', 'DATABASE_FQDN', 'DATABASE_NAME'];
  if (requiredEnvVariables.some(variable => !process.env[variable])) {
    console.error(`Missing required environment variables: ${requiredEnvVariables.join(', ')}`);
    return { observabilityBucket };
  }

  /**
   * Certificate
   */
  const certificate = Certificate.fromCertificateArn(stack, `${stack.stackName}Certificate`, process.env.CERTIFICATE_ARN!);

  /**
   * Auth
   */
  const { userPool, userPoolDomain, userPoolClient } = createCognitoAuth(stack, preTokenGenerationLambda);

  /**
   * Frontend
   */
  const { distribution } = createDistribution(stack, frontendBucket, certificate);

  /**
   * Frontend AutoBuild Project
   */
  const { frontendBuildProject } = createBuildProject(stack, frontendBucket, distribution, userPool, userPoolDomain, userPoolClient);

  /**
   * Return the bucket for the ECS Task to upload the files
   */
  return { observabilityBucket };
};

export { createObservabilityInfrastructure };
