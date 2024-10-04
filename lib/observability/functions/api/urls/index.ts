import { Stack } from 'aws-cdk-lib';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../../common/utils/api';

/**
 * Creates a Node.js Lambda function for handling URLs within the specified stack.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createUrlsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const urlsLambda = new NodejsFunction(stack, `${stack.stackName}UrlsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'Urls', './lib/observability/functions/api/urls/list.src.ts', defaultApiEnvironment),
  });

  return { urlsLambda };
};


/**
 * Creates a URL stats lambda function.
 *
 * @param stack - The stack object.
 * @param defaultApiEnvironment - The default API environment.
 * @returns An object containing the URL stats lambda function.
 */
const createUrlStatsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const urlStatsLambda = new NodejsFunction(stack, `${stack.stackName}UrlStatsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'UrlStats', './lib/observability/functions/api/urls/stats.src.ts', defaultApiEnvironment),
  });

  return { urlStatsLambda };
};

/**
 * Creates the URL Executions Lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param defaultApiEnvironment - The default environment variables for the API.
 * @returns An object containing the `executionsLambda` function.
 */
const createURLExecutionsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const urlExecutionsLambda = new NodejsFunction(stack, `${stack.stackName}URLExecutionsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'URLExecutions', './lib/observability/functions/api/urls/executions.src.ts', defaultApiEnvironment),
  });

  return { urlExecutionsLambda };
};


export { createUrlsLambda, createUrlStatsLambda, createURLExecutionsLambda };