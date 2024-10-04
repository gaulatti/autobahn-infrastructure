import { Stack } from 'aws-cdk-lib';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../../common/utils/api';

/**
 * Creates a Lambda function for handling the list of projects.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be defined.
 * @param defaultApiEnvironment - A record of environment variables to be used by the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createProjectsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const projectsLambda = new NodejsFunction(stack, `${stack.stackName}ProjectsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'Projects', './lib/observability/functions/api/projects/list.src.ts', defaultApiEnvironment),
  });

  return { projectsLambda };
};

/**
 * Creates a Lambda function for creating a new project.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be defined.
 * @param defaultApiEnvironment - A record of environment variables to be used by the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createNewProjectLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const createProjectLambda = new NodejsFunction(stack, `${stack.stackName}CreateProjectLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'CreateProject', './lib/observability/functions/api/projects/create.src.ts', defaultApiEnvironment),
  });

  return { createProjectLambda };
};

/**
 * Creates a Lambda function for fetching project details.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be defined.
 * @param defaultApiEnvironment - A record of environment variables to be used by the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createProjectDetailsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const projectDetailsLambda = new NodejsFunction(stack, `${stack.stackName}ProjectDetailsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'ProjectDetails', './lib/observability/functions/api/projects/details.src.ts', defaultApiEnvironment),
  });

  return { projectDetailsLambda };
};

/**
 * Creates a Lambda function for updating an existing project.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be defined.
 * @param defaultApiEnvironment - A record of environment variables to be used by the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createUpdateProjectLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const updateProjectLambda = new NodejsFunction(stack, `${stack.stackName}UpdateProjectLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'UpdateProject', './lib/observability/functions/api/projects/update.src.ts', defaultApiEnvironment),
  });

  return { updateProjectLambda };
};

/**
 * Creates a Lambda function for deleting a project.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be defined.
 * @param defaultApiEnvironment - A record of environment variables to be used by the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createDeleteProjectLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const deleteProjectLambda = new NodejsFunction(stack, `${stack.stackName}DeleteProjectLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'DeleteProject', './lib/observability/functions/api/projects/delete.src.ts', defaultApiEnvironment),
  });

  return { deleteProjectLambda };
};

/**
 * Creates a Lambda function for fetching project statistics.
 *
 * @param stack - The AWS CDK stack in which the Lambda function will be defined.
 * @param defaultApiEnvironment - A record of environment variables to be used by the Lambda function.
 * @returns An object containing the created Lambda function.
 */
const createProjectStatsLambda = (stack: Stack, defaultApiEnvironment: Record<string, string>) => {
  const projectStatsLambda = new NodejsFunction(stack, `${stack.stackName}ProjectStatsLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'ProjectStats', './lib/observability/functions/api/projects/stats.src.ts', defaultApiEnvironment),
  });

  return { projectStatsLambda };
};

export {
  createProjectsLambda,
  createNewProjectLambda,
  createProjectDetailsLambda,
  createUpdateProjectLambda,
  createDeleteProjectLambda,
  createProjectStatsLambda,
};