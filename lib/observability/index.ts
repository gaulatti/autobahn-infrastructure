import { Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { createCognitoAuth } from './authorization';
import { createPostAuthenticationTrigger, createPreAuthenticationTrigger } from './authorization/triggers';
import { createBuildProject } from './build';
import { createDashboard } from './dashboard';
import { createDataAccessLambda } from './functions/dal';
import { createProcessingLambda } from './functions/processing';
import { createDistribution } from './network';
import { createSecrets } from './secrets';
import { createBuckets } from './storage';

const createObservabilityInfrastructure = (stack: Stack) => {
  /**
   * Secrets
   */
  const { certificateArnSecret, frontendFqdnSecret, appleSecret, googleSecret } = createSecrets(stack);

  /**
   * Certificate
   */
  const certificate = Certificate.fromCertificateArn(stack, `${stack.stackName}Certificate`, certificateArnSecret.secretValue.unsafeUnwrap());

  /**
   * Storage (S3)
   */
  const { observabilityBucket, frontendBucket } = createBuckets(stack);

  /**
   * Lambdas
   */
  const { dataAccessLambda } = createDataAccessLambda(stack);
  const { processingLambda } = createProcessingLambda(stack, observabilityBucket, dataAccessLambda);
  const { preAuthenticationLambda } = createPreAuthenticationTrigger(stack, dataAccessLambda);
  const { postAuthenticationLambda } = createPostAuthenticationTrigger(stack, dataAccessLambda);

  /**
   * Auth
   */
  const { userPool } = createCognitoAuth(stack, frontendFqdnSecret, preAuthenticationLambda, postAuthenticationLambda, appleSecret, googleSecret);

  /**
   * Dashboard
   */
  const { dashboard } = createDashboard(stack);

  /**
   * Important: For the following code snippets to work, a first deployment without them has to be executed
   * to create the secrets. Then, manually the secrets need to be updated with the correct values before
   * creating the distribution and the autobuild project.
   *
   * The reason why we're using secrets here is to ensure that the secrets are not stored in the codebase.
   *
   * That explains why Secrets are used instead of System Manager Parameters.
   *
   * TL;DR:
   * 1. Deploy the stack without the following code snippets (frontend distribution and autobuild project)
   * 2. Update the secrets with the correct values in the AWS Console
   * 3. Uncomment the following code snippets
   * 4. Deploy the stack again
   */

  /**
   * Frontend
   */
  const { distribution } = createDistribution(stack, frontendBucket, frontendFqdnSecret, certificate);

  /**
   * Frontend AutoBuild Project
   */
  const { frontendBuildProject } = createBuildProject(stack, frontendBucket, distribution);

  /**
   * Return the bucket for the ECS Task to upload the files
   */
  return { observabilityBucket };
};

export { createObservabilityInfrastructure };
