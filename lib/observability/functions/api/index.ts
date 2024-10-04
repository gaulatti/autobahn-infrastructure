import { Stack } from 'aws-cdk-lib';
import { WebSocketApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
  createExecutionDetailsLambda,
  createExecutionJSONLambda,
  createExecutionResultLambda,
  createExecutionsLambda,
  createRetryExecutionLambda,
  createTriggerExecutionLambda,
} from './executions';

import { createKickoffLambda } from './kickoff';

import {
  createProjectsLambda,
  createNewProjectLambda,
  createProjectDetailsLambda,
  createUpdateProjectLambda,
  createDeleteProjectLambda,
  createProjectStatsLambda,
} from './projects';

import { createUrlsLambda, createUrlStatsLambda, createURLExecutionsLambda } from './urls';

import {
  createTargetsLambda,
  createNewTargetLambda,
  createTargetDetailsLambda,
  createUpdateTargetLambda,
  createDeleteTargetLambda,
  createTargetStatsLambda,
  createTargetUrlsLambda,
  createTargetPulsesLambda,
  createSetBaselinesLambda,
} from './targets';

import {
  createSchedulesLambda,
  createNewScheduleLambda,
  createScheduleDetailsLambda,
  createUpdateScheduleLambda,
  createDeleteScheduleLambda,
} from './schedules';

/**
 * Creates the API lambdas.
 *
 * @param stack - The stack object.
 * @param defaultApiEnvironment - The default API environment.
 * @param triggerTopic - The trigger topic.
 * @param observabilityBucket - The observability bucket.
 * @param webSocketApi - The WebSocket API.
 * @returns An object containing the kickoffLambda.
 */
const createApiLambdas = (
  stack: Stack,
  defaultApiEnvironment: Record<string, string>,
  triggerTopic: Topic,
  observabilityBucket: Bucket,
  webSocketApi: WebSocketApi
) => {
  /**
   * Executions API.
   */
  const { kickoffLambda } = createKickoffLambda(stack, defaultApiEnvironment);
  const { executionsLambda } = createExecutionsLambda(stack, defaultApiEnvironment);
  const { retryExecutionLambda } = createRetryExecutionLambda(stack, defaultApiEnvironment, triggerTopic, webSocketApi);
  const { triggerExecutionLambda } = createTriggerExecutionLambda(stack, defaultApiEnvironment, triggerTopic, webSocketApi);
  const { executionResultLambda } = createExecutionResultLambda(stack, defaultApiEnvironment);
  const { executionDetailsLambda } = createExecutionDetailsLambda(stack, defaultApiEnvironment, observabilityBucket);
  const { executionJSONLambda } = createExecutionJSONLambda(stack, defaultApiEnvironment, observabilityBucket);

  /**
   * Projects API.
   */
  const { projectsLambda } = createProjectsLambda(stack, defaultApiEnvironment);
  const { createProjectLambda } = createNewProjectLambda(stack, defaultApiEnvironment);
  const { projectDetailsLambda } = createProjectDetailsLambda(stack, defaultApiEnvironment);
  const { updateProjectLambda } = createUpdateProjectLambda(stack, defaultApiEnvironment);
  const { deleteProjectLambda } = createDeleteProjectLambda(stack, defaultApiEnvironment);
  const { projectStatsLambda } = createProjectStatsLambda(stack, defaultApiEnvironment);

  /**
   * URL API.
   */
  const { urlsLambda } = createUrlsLambda(stack, defaultApiEnvironment);
  const { urlStatsLambda } = createUrlStatsLambda(stack, defaultApiEnvironment);
  const { urlExecutionsLambda } = createURLExecutionsLambda(stack, defaultApiEnvironment);

  /**
   * Targets API.
   */
  const { targetsLambda } = createTargetsLambda(stack, defaultApiEnvironment);
  const { createTargetLambda } = createNewTargetLambda(stack, defaultApiEnvironment);
  const { targetDetailsLambda } = createTargetDetailsLambda(stack, defaultApiEnvironment);
  const { updateTargetLambda } = createUpdateTargetLambda(stack, defaultApiEnvironment);
  const { deleteTargetLambda } = createDeleteTargetLambda(stack, defaultApiEnvironment);
  const { targetStatsLambda } = createTargetStatsLambda(stack, defaultApiEnvironment);
  const { targetUrlsLambda } = createTargetUrlsLambda(stack, defaultApiEnvironment);
  const { targetPulsesLambda } = createTargetPulsesLambda(stack, defaultApiEnvironment);
  const { setBaselinesLambda } = createSetBaselinesLambda(stack, defaultApiEnvironment);

  /**
   * Schedules API.
   */
  const { schedulesLambda } = createSchedulesLambda(stack, defaultApiEnvironment);
  const { createScheduleLambda } = createNewScheduleLambda(stack, defaultApiEnvironment);
  const { scheduleDetailsLambda } = createScheduleDetailsLambda(stack, defaultApiEnvironment);
  const { updateScheduleLambda } = createUpdateScheduleLambda(stack, defaultApiEnvironment);
  const { deleteScheduleLambda } = createDeleteScheduleLambda(stack, defaultApiEnvironment);

  return {
    kickoffLambda,
    executionDetailsLambda,
    executionsLambda,
    triggerExecutionLambda,
    executionResultLambda,
    retryExecutionLambda,
    urlStatsLambda,
    urlExecutionsLambda,
    executionJSONLambda,
    projectsLambda,
    createProjectLambda,
    projectDetailsLambda,
    updateProjectLambda,
    deleteProjectLambda,
    projectStatsLambda,
    urlsLambda,
    targetsLambda,
    createTargetLambda,
    targetUrlsLambda,
    targetPulsesLambda,
    targetDetailsLambda,
    updateTargetLambda,
    deleteTargetLambda,
    targetStatsLambda,
    setBaselinesLambda,
    schedulesLambda,
    createScheduleLambda,
    scheduleDetailsLambda,
    updateScheduleLambda,
    deleteScheduleLambda,
  };
};

export { createApiLambdas };