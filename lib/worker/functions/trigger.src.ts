import { AssignPublicIp, ECSClient, LaunchType, RunTaskCommand, RunTaskCommandInput } from '@aws-sdk/client-ecs';

/**
 * Represents the ECS client.
 */
const ecsClient = new ECSClient();

/**
 * Entry point of the application.
 * Triggers a Fargate task with the provided parameters.
 *
 * @param _event - The event object passed to the Lambda function.
 */
const main = async (_event: any) => {
  const { URL_PARAMETER, TARGET_PARAMETER, API_KEY_PARAMETER, CLUSTER, TASK_DEFINITION, CONTAINER_NAME, SUBNETS, SECURITY_GROUP } = process.env;
  const subnets = SUBNETS!.split(',');

  /**
   * Represents the parameters used to run the Fargate task.
   */
  const params: RunTaskCommandInput = {
    cluster: CLUSTER,
    taskDefinition: TASK_DEFINITION,
    launchType: LaunchType.FARGATE,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups: [SECURITY_GROUP!],
        assignPublicIp: AssignPublicIp.ENABLED,
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: CONTAINER_NAME,
          environment: [
            { name: 'URL_PARAMETER', value: URL_PARAMETER },
            { name: 'TARGET_PARAMETER', value: TARGET_PARAMETER },
            { name: 'API_KEY_PARAMETER', value: API_KEY_PARAMETER },
            { name: 'LHCI_BUILD_CONTEXT__COMMIT_TIME', value: new Date().toISOString() },
            { name: 'LHCI_BUILD_CONTEXT__CURRENT_HASH', value: new Date().toISOString() },
            { name: 'LHCI_BUILD_CONTEXT__COMMIT_MESSAGE', value: new Date().toISOString() },
            { name: 'LHCI_BUILD_CONTEXT__CURRENT_BRANCH', value: 'prod' },
            { name: 'LHCI_BUILD_CONTEXT__AUTHOR', value: 'clarin.com' },
            { name: 'LHCI_BUILD_CONTEXT__AVATAR_URL', value: 'https://cdn.worldvectorlogo.com/logos/clarin-2.svg' },
          ],
        },
      ],
    },
  };

  /**
   * Run the Fargate task
   */
  try {
    const command = new RunTaskCommand(params);
    const response = await ecsClient.send(command);
    console.log('Fargate task started:', response);
  } catch (error) {
    console.error('Error triggering Fargate task:', error);
  }
};

export { main };