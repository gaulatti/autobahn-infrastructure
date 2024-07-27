import { Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { createApi } from './api';
import { createCognitoAuth } from './authorization';
import { createBuildProject } from './build';
import { createDashboard } from './dashboard';
import { createApiLambdas } from './functions/api';
import { createPreTokenGenerationTrigger } from './functions/authorization';
import { createKickoffCacheLambda } from './functions/cache';
import { createDataAccessLambda } from './functions/dal';
import { createProcessingLambda } from './functions/processing';
import { createDistribution } from './network';
import { createKickoffTable } from './persistence';
import { createBuckets } from './storage';
import { Topic } from 'aws-cdk-lib/aws-sns';

const createObservabilityInfrastructure = (stack: Stack, triggerTopic: Topic) => {
  /**
   * Storage (S3)
   */
  const { observabilityBucket, frontendBucket } = createBuckets(stack);

  /**
   * Persistence (DynamoDB)
   */
  const { kickoffTable } = createKickoffTable(stack);

  /**
   * Persistence / Cache Lambdas
   */
  const { dataAccessLambda } = createDataAccessLambda(stack);
  const { kickoffCacheLambda } = createKickoffCacheLambda(stack, dataAccessLambda, kickoffTable);

  /**
   * API Lambdas
   */
  const defaultApiEnvironment = {
    DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    KICKOFF_CACHE_ARN: kickoffCacheLambda.functionArn,
    FRONTEND_FQDN: process.env.FRONTEND_FQDN!,
  };
  const { preTokenGenerationLambda } = createPreTokenGenerationTrigger(stack, defaultApiEnvironment);
  const apiLambdas = { preTokenGenerationLambda, ...createApiLambdas(stack, defaultApiEnvironment, triggerTopic) };
  for (const lambdaFunction of Object.values(apiLambdas)) {
    dataAccessLambda.grantInvoke(lambdaFunction);
    kickoffCacheLambda.grantInvoke(lambdaFunction);
  }

  /**
   * Worker Lambda
   */
  const { processingLambda } = createProcessingLambda(stack, observabilityBucket, dataAccessLambda);
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
  if (requiredEnvVariables.some((variable) => !process.env[variable])) {
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
   * API
   */
  const { apiGateway } = createApi(stack, userPool, apiLambdas);

  /**
   * Frontend AutoBuild Project
   */
  const { frontendBuildProject } = createBuildProject(stack, frontendBucket, distribution, userPool, userPoolDomain, userPoolClient, apiGateway);

  /**
   * Return the bucket for the ECS Task to upload the files
   */
  return { observabilityBucket };
};

export { createObservabilityInfrastructure };
