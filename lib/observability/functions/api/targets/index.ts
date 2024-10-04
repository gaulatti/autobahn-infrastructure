import { Stack } from 'aws-cdk-lib';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../../common/utils/api';

/**
 * Creates a Lambda function for listing targets.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createTargetsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const targetsLambda = new NodejsFunction(stack, `${stack.stackName}TargetsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'Targets', './lib/observability/functions/api/targets/list.src.ts', defaultApiEnvironment),
  });

  return { targetsLambda };
};

/**
 * Creates a Lambda function for creating a new target.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createNewTargetLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const createTargetLambda = new NodejsFunction(stack, `${stack.stackName}CreateTargetLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'CreateTarget', './lib/observability/functions/api/targets/create.src.ts', defaultApiEnvironment),
  });

  return { createTargetLambda };
};

/**
 * Creates a Lambda function for fetching target details.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createTargetDetailsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const targetDetailsLambda = new NodejsFunction(stack, `${stack.stackName}TargetDetailsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'TargetDetails', './lib/observability/functions/api/targets/details.src.ts', defaultApiEnvironment),
  });

  return { targetDetailsLambda };
};

/**
 * Creates a Lambda function for updating an existing target.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createUpdateTargetLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const updateTargetLambda = new NodejsFunction(stack, `${stack.stackName}UpdateTargetLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'UpdateTarget', './lib/observability/functions/api/targets/update.src.ts', defaultApiEnvironment),
  });

  return { updateTargetLambda };
};

/**
 * Creates a Lambda function for deleting a target.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createDeleteTargetLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const deleteTargetLambda = new NodejsFunction(stack, `${stack.stackName}DeleteTargetLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'DeleteTarget', './lib/observability/functions/api/targets/delete.src.ts', defaultApiEnvironment),
  });

  return { deleteTargetLambda };
};

/**
 * Creates a Lambda function for fetching target statistics.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createTargetStatsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const targetStatsLambda = new NodejsFunction(stack, `${stack.stackName}TargetStatsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'TargetStats', './lib/observability/functions/api/targets/stats.src.ts', defaultApiEnvironment),
  });

  return { targetStatsLambda };
};

/**
 * Creates a Lambda function for generating target URLs.
 *
 * @param stack - The AWS CDK stack in which the Lambda function is defined.
 * @param defaultApiEnvironment - A record containing default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createTargetUrlsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const targetUrlsLambda = new NodejsFunction(stack, `${stack.stackName}TargetUrlsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'TargetUrls', './lib/observability/functions/api/targets/urls.src.ts', defaultApiEnvironment),
  });

  return { targetUrlsLambda };
};

/**
 * Creates a new Node.js Lambda function for handling target pulses.
 *
 * @param stack - The AWS CDK stack in which this Lambda function is defined.
 * @param defaultApiEnvironment - A record of environment variables to be passed to the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createTargetPulsesLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const targetPulsesLambda = new NodejsFunction(stack, `${stack.stackName}TargetPulsesLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'TargetPulses', './lib/observability/functions/api/targets/pulses.src.ts', defaultApiEnvironment),
  });

  return { targetPulsesLambda };
};


/**
 * Creates a Lambda function for setting baselines.
 *
 * @param stack - The AWS CDK stack in which the Lambda function is defined.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createSetBaselinesLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const setBaselinesLambda = new NodejsFunction(stack, `${stack.stackName}SetBaselinesLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'SetBaselines', './lib/observability/functions/api/targets/baselines.src.ts', defaultApiEnvironment),
  });

  return { setBaselinesLambda };
};

export {
  createTargetsLambda,
  createNewTargetLambda,
  createTargetDetailsLambda,
  createUpdateTargetLambda,
  createDeleteTargetLambda,
  createTargetStatsLambda,
  createTargetUrlsLambda,
  createTargetPulsesLambda,
  createSetBaselinesLambda
};