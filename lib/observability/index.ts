import { Duration, Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { capitalize } from '../common/utils';
import { createRestApi, createWebsocketApi } from './api';
import { createCognitoAuth } from './authorization';
import { createBuildProject } from './build';
import { createDashboard } from './dashboard';
import { createApiLambdas } from './functions/api';
import { createPreTokenGenerationTrigger } from './functions/authorization';
import { createFailureHandlerLambda, createProcessingLambda } from './functions/background';
import { createKickoffCacheLambda } from './functions/cache';
import { createDataAccessLambda } from './functions/dal';
import { createWebSocketLambdas } from './functions/websockets';
import { createDistribution } from './network';
import { createCacheTable } from './persistence';
import { createBuckets } from './storage';

const createObservabilityInfrastructure = (stack: Stack, triggerTopic: Topic) => {
  /**
   * Storage (S3)
   */
  const { observabilityBucket, frontendBucket } = createBuckets(stack);

  /**
   * Persistence (DynamoDB)
   */
  const { cacheTable } = createCacheTable(stack);

  /**
   * Persistence / Cache Lambdas
   */
  const { dataAccessLambda } = createDataAccessLambda(stack);
  const { kickoffCacheLambda } = createKickoffCacheLambda(stack, dataAccessLambda, cacheTable);

  /**
   * API Lambdas
   */
  const defaultApiEnvironment = {
    DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    KICKOFF_CACHE_ARN: kickoffCacheLambda.functionArn,
    FRONTEND_FQDN: process.env.FRONTEND_FQDN!,
    CACHE_TABLE_NAME: cacheTable.tableName,
  };

  /**
   * Pre Token Generation Lambda
   */
  const { preTokenGenerationLambda } = createPreTokenGenerationTrigger(stack, defaultApiEnvironment);

  /**
   * Auth
   */
  const { userPool, userPoolDomain, userPoolClient } = createCognitoAuth(stack, preTokenGenerationLambda);

  /**
   * Websocket API
   */
  const webSocketLambdas = createWebSocketLambdas(stack, defaultApiEnvironment, userPool, cacheTable);
  const { webSocketApi } = createWebsocketApi(stack, webSocketLambdas);
  Object.entries(webSocketLambdas).forEach(([key, lambdaFunction]) => {
    dataAccessLambda.grantInvoke(lambdaFunction);
    kickoffCacheLambda.grantInvoke(lambdaFunction);
    cacheTable.grantReadWriteData(lambdaFunction);

    /**
     * Keep Lambdas Warm
     */
    const rule = new Rule(stack, `${stack.stackName}${capitalize(key)}WarmupRule`, {
      schedule: Schedule.rate(Duration.minutes(1)),
    });

    rule.addTarget(
      new LambdaFunction(lambdaFunction, {
        event: RuleTargetInput.fromObject({
          source: 'cdk.schedule',
          action: 'warmup',
        }),
      })
    );
  });

  const apiLambdas = { preTokenGenerationLambda, ...createApiLambdas(stack, defaultApiEnvironment, triggerTopic, observabilityBucket, webSocketApi) };
  Object.entries(apiLambdas).forEach(([key, lambdaFunction]) => {
    dataAccessLambda.grantInvoke(lambdaFunction);
    kickoffCacheLambda.grantInvoke(lambdaFunction);
    cacheTable.grantReadWriteData(lambdaFunction);

    /**
     * Keep Lambdas Warm
     */
    const rule = new Rule(stack, `${stack.stackName}${capitalize(key)}WarmupRule`, {
      schedule: Schedule.rate(Duration.minutes(1)),
    });

    rule.addTarget(
      new LambdaFunction(lambdaFunction, {
        event: RuleTargetInput.fromObject({
          source: 'cdk.schedule',
          action: 'warmup',
        }),
      })
    );
  });

  /**
   * Worker Lambda
   */
  const { processingLambda } = createProcessingLambda(stack, defaultApiEnvironment, observabilityBucket, dataAccessLambda, webSocketApi);
  const { failureHandlerLambda } = createFailureHandlerLambda(stack, defaultApiEnvironment, dataAccessLambda, webSocketApi, triggerTopic);
  cacheTable.grantReadWriteData(processingLambda);
  cacheTable.grantReadWriteData(failureHandlerLambda);

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
    return { observabilityBucket, failureHandlerLambda };
  }

  /**
   * Certificate
   */
  const certificate = Certificate.fromCertificateArn(stack, `${stack.stackName}Certificate`, process.env.CERTIFICATE_ARN!);

  /**
   * Frontend
   */
  const { distribution } = createDistribution(stack, frontendBucket, certificate);

  /**
   * REST API
   */
  const { restApi } = createRestApi(stack, userPool, apiLambdas);

  /**
   * Frontend AutoBuild Project
   */
  const { frontendBuildProject } = createBuildProject(stack, frontendBucket, distribution, userPool, userPoolDomain, userPoolClient, restApi, webSocketApi);

  /**
   * Return the bucket for the ECS Task to upload the files
   */
  return { observabilityBucket, failureHandlerLambda };
};

export { createObservabilityInfrastructure };
