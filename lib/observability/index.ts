import { Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { createCognitoAuth } from './authorization';
import { createPreSignUpTrigger, createPostConfirmationTrigger } from './authorization/triggers';
import { createBuildProject } from './build';
import { createDashboard } from './dashboard';
import { createDataAccessLambda } from './functions/dal';
import { createProcessingLambda } from './functions/processing';
import { createDistribution } from './network';
import { createBuckets } from './storage';

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
  const { preSignUpLambda } = createPreSignUpTrigger(stack, dataAccessLambda);
  const { postConfirmationLambda } = createPostConfirmationTrigger(stack, dataAccessLambda);

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
   *
   * Plus, GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set for
   * the Google Identity Provider (required in createCognitoAuth function)
   */

  if (!process.env.CERTIFICATE_ARN || !process.env.FRONTEND_FQDN) {
    console.error('Please set the CERTIFICATE_ARN and FRONTEND_FQDN environment variables.');
    return { observabilityBucket };
  }
  /**
   * Certificate
   */
  const certificate = Certificate.fromCertificateArn(stack, `${stack.stackName}Certificate`, process.env.CERTIFICATE_ARN);

  /**
   * Auth
   */
  const { userPool, userPoolDomain, userPoolClient } = createCognitoAuth(stack, preSignUpLambda, postConfirmationLambda);

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
