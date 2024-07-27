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
  const { CLUSTER, TASK_DEFINITION, CONTAINER_NAME, SUBNETS, SECURITY_GROUP } = process.env;
  const subnets = SUBNETS!.split(',');

  const { Records } = event;
  if (Array.isArray(Records)) {
    for (const record of Records) {
      const {
        Sns: { Message },
      } = record;

      try {
        const { url, uuid, mode } = JSON.parse(Message);

        /**
         * Represents the parameters used to run the Fargate task.
         */
        const parameters:  RunTaskCommandInput = {
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
                  { name: 'TARGET_PARAMETER', value: url },
                  { name: 'PRESET_FLAG', value: mode === 'desktop' ? '--preset=desktop' : '' },
                  { name: 'UUID', value: uuid },
                  { name: 'MODE', value: mode },
                ],
              },
            ],
          },
        };

        /**
         * Run the Fargate tasks
         */
        const execution = new RunTaskCommand(parameters);
        await ecsClient.send(execution);
      } catch (error) {
        throw new Error(`Error triggering the fargate task (${error})`);
      }
    }
  }


};

export { main };
