import { AssignPublicIp, ECSClient, LaunchType, RunTaskCommand, RunTaskCommandInput } from '@aws-sdk/client-ecs';
import { SNSEvent } from 'aws-lambda';

/**
 * Represents the ECS client.
 */
const ecsClient = new ECSClient();

/**
 * Entry point of the application.
 * Triggers a Fargate task with the provided parameters.
 *
 * @param event - The event object passed to the Lambda function.
 */
const main = async (event: SNSEvent) => {
  const { URL_PARAMETER, CLUSTER, TASK_DEFINITION, CONTAINER_NAME, SUBNETS, SECURITY_GROUP } = process.env;
  const subnets = SUBNETS!.split(',');

  const { Records } = event;
  if (Array.isArray(Records)) {
    for (const record of Records) {
      const {
        Sns: { Message },
      } = record;

      try {
        const parsedMessage = JSON.parse(Message);
        console.log('Parsed message:', parsedMessage);
      } catch (error) {
        throw new Error(`Error parsing the SNS Message (${Message})`);
      }
    }
  }

  /**
   * Creates the parameters used to run the Fargate task.
   *
   * @param isDesktop - A boolean indicating whether the task is for desktop or not.
   * @returns The parameters used to run the Fargate task.
   */
  const createParams = (isDesktop: boolean): RunTaskCommandInput => {
    /**
     * By now hardcoding it. If it doesn't come from the SNS Event, this is the fallback value.
     */
    const target = 'www.cnn.com';

    /**
     * Represents the parameters used to run the Fargate task.
     */
    return {
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
              { name: 'URL_PARAMETER', value: `http://${URL_PARAMETER}` },
              { name: 'TARGET_PARAMETER', value: `https://${target}` },
              { name: 'PRESET_FLAG', value: isDesktop ? '--preset=desktop' : '' },
              { name: 'LHCI_BUILD_CONTEXT__COMMIT_TIME', value: new Date().toISOString() },
              { name: 'LHCI_BUILD_CONTEXT__CURRENT_HASH', value: new Date().toISOString() },
              { name: 'LHCI_BUILD_CONTEXT__COMMIT_MESSAGE', value: new Date().toISOString() },
              { name: 'LHCI_BUILD_CONTEXT__CURRENT_BRANCH', value: isDesktop ? 'prod' : 'prod-mobile' },
              { name: 'LHCI_BUILD_CONTEXT__AUTHOR', value: 'cnn.com' },
              {
                name: 'LHCI_BUILD_CONTEXT__AVATAR_URL',
                value: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/CNN_International_logo.svg/480px-CNN_International_logo.svg.png',
              },
            ],
          },
        ],
      },
    };
  };

  /**
   * Run the Fargate tasks
   */
  try {
    const mobileParams = createParams(false);
    const mobileExecution = new RunTaskCommand(mobileParams);
    await ecsClient.send(mobileExecution);

    const desktopParams = createParams(true);
    const desktopExecution = new RunTaskCommand(desktopParams);
    await ecsClient.send(desktopExecution);
  } catch (error) {
    console.error('Error triggering Fargate task:', error);
  }
};

export { main };
