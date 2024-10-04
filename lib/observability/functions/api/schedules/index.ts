import { Stack } from 'aws-cdk-lib';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../../common/utils/api';

/**
 * Creates a Lambda function for listing schedules.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createSchedulesLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const schedulesLambda = new NodejsFunction(stack, `${stack.stackName}SchedulesLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'Schedules', './lib/observability/functions/api/schedules/list.src.ts', defaultApiEnvironment),
  });

  return { schedulesLambda };
};

/**
 * Creates a Lambda function for creating a new schedule.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createNewScheduleLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const createScheduleLambda = new NodejsFunction(stack, `${stack.stackName}CreateScheduleLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'CreateSchedule', './lib/observability/functions/api/schedules/create.src.ts', defaultApiEnvironment),
  });

  return { createScheduleLambda };
};

/**
 * Creates a Lambda function for fetching schedule details.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createScheduleDetailsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const scheduleDetailsLambda = new NodejsFunction(stack, `${stack.stackName}ScheduleDetailsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'ScheduleDetails', './lib/observability/functions/api/schedules/details.src.ts', defaultApiEnvironment),
  });

  return { scheduleDetailsLambda };
};

/**
 * Creates a Lambda function for updating an existing schedule.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createUpdateScheduleLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const updateScheduleLambda = new NodejsFunction(stack, `${stack.stackName}UpdateScheduleLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'UpdateSchedule', './lib/observability/functions/api/schedules/update.src.ts', defaultApiEnvironment),
  });

  return { updateScheduleLambda };
};

/**
 * Creates a Lambda function for deleting a schedule.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be created.
 * @param defaultApiEnvironment - A record containing the default environment variables for the API.
 * @returns An object containing the created Lambda function.
 */
const createDeleteScheduleLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const deleteScheduleLambda = new NodejsFunction(stack, `${stack.stackName}DeleteScheduleLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'DeleteSchedule', './lib/observability/functions/api/schedules/delete.src.ts', defaultApiEnvironment),
  });

  return { deleteScheduleLambda };
};

export {
  createSchedulesLambda,
  createNewScheduleLambda,
  createScheduleDetailsLambda,
  createUpdateScheduleLambda,
  createDeleteScheduleLambda,
};