import { AssignPublicIp, ECSClient, LaunchType, RunTaskCommand, RunTaskCommandInput } from '@aws-sdk/client-ecs';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { Readable } from 'stream';
import { extractLighthouseSummary } from '../../../utils/plugins';
import { streamToString } from '../../../utils/s3';
/**
 * Main Lambda function for the Lighthouse Provider.
 */
const snsClient = new SNSClient();

/**
 * Represents the ECS client.
 */
const ecsClient = new ECSClient();

/**
 * Represents the Secrets Manager client.
 */
const secretsManagerClient = new SecretsManagerClient();

/**
 * Represents the S3 client.
 */
const s3Client = new S3Client();

/**
 * Builds the parameters required to run an ECS Fargate task.
 *
 * @param cluster - The name of the ECS cluster.
 * @param taskDefinition - The task definition to use for the task.
 * @param subnets - The subnets to associate with the task.
 * @param securityGroup - The security group to associate with the task.
 * @param name - The name of the container.
 * @param url - The target URL for the Lighthouse test.
 * @param id - The unique identifier for the task.
 * @param isDesktop - Optional flag to indicate if the task is for desktop mode. Defaults to false.
 *
 * @returns The parameters required to run the ECS Fargate task.
 */
const buildParameters = (
  cluster: string,
  taskDefinition: string,
  subnets: string[],
  securityGroup: string,
  name: string,
  url: string,
  id: string,
  isDesktop: boolean,
  retries: number
): RunTaskCommandInput => {
  const environment = [
    { name: 'TARGET_PARAMETER', value: url },
    { name: 'UUID', value: id },
    { name: 'SEGUE_ARN', value: process.env.SEGUE_ARN },
    { name: 'ERROR_LAMBDA_ARN', value: process.env.SEGUE_ARN },
    { name: 'RETRIES', value: retries.toString() },
  ];

  if (isDesktop) {
    environment.push({ name: 'PRESET_FLAG', value: '--preset=desktop' });
    environment.push({ name: 'MODE', value: 'desktop' });
  } else {
    environment.push({ name: 'MODE', value: 'mobile' });
  }

  const parameters = {
    cluster,
    taskDefinition,
    launchType: LaunchType.FARGATE,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets,
        securityGroups: [securityGroup!],
        assignPublicIp: AssignPublicIp.ENABLED,
      },
    },
    overrides: {
      containerOverrides: [
        {
          name,
          environment,
        },
      ],
    },
  };

  return parameters;
};

/**
 * Main handler function for the Lighthouse Provider Lambda.
 *
 * @param event - The event object passed to the Lambda function.
 *
 * This function logs a greeting message along with the event and a custom message.
 * It then constructs a message payload and publishes it to an SNS topic specified by the
 * `UPDATE_PLAYLIST_TOPIC_ARN` environment variable.
 *
 * @returns {Promise<void>} - A promise that resolves when the message is successfully sent to the SNS topic.
 *
 * @throws {Error} - If there is an error sending the message to the SNS topic, it logs the error.
 */
const main = async (event: any): Promise<void> => {
  const { CLUSTER, TASK_DEFINITION, CONTAINER_NAME, SUBNETS, SECURITY_GROUP } = process.env;
  const subnets = SUBNETS!.split(',');

  /**
   * Segue Params
   */
  const { playlist, action, uuid, bucketName, mode, status, url: failedUrl, retries } = event;

  /**
   * Get the secret value from Secrets Manager.
   */
  const { SecretString } = await secretsManagerClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.KEY_ARN,
    })
  );

  if (!!action) {
    console.log('Segue action detected, skipping Fargate task');

    /**
     * Get the object from S3.
     */
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `${uuid}.${mode}.json`,
      })
    );
    const bodyContents = await streamToString(response.Body as Readable);

    /**
     * Extract the Lighthouse summary from the body contents.
     */
    const output = extractLighthouseSummary(bodyContents, mode);

    /**
     * Publish the message to the SNS topic.
     */
    try {
      const params = {
        Message: JSON.stringify({ output, id: uuid, key: SecretString }),
        TopicArn: process.env.UPDATE_PLAYLIST_TOPIC_ARN,
      };

      const data = await snsClient.send(new PublishCommand(params));
    } catch (err) {
      console.error('Error sending message to SNS topic', err);
    }
    return;
  }

  if (status === 'FAILED') {
    if (retries > 5) {
      try {
        const params = {
          Message: JSON.stringify({ failed: true, id: uuid, key: SecretString }),
          TopicArn: process.env.UPDATE_PLAYLIST_TOPIC_ARN,
        };

        await snsClient.send(new PublishCommand(params));
        return;
      } catch (err) {
        console.error('Error sending message to SNS topic', err);
      }
    }

    console.log('Retrying', JSON.stringify({ retries, failedUrl }));
    try {
      /**
       * Run the Fargate tasks
       */
      const desktopParameters = buildParameters(CLUSTER!, TASK_DEFINITION!, subnets, SECURITY_GROUP!, CONTAINER_NAME!, failedUrl, uuid, true, retries);
      const mobileParameters = buildParameters(CLUSTER!, TASK_DEFINITION!, subnets, SECURITY_GROUP!, CONTAINER_NAME!, failedUrl, uuid, false, retries);
      await ecsClient.send(new RunTaskCommand(desktopParameters));
      await ecsClient.send(new RunTaskCommand(mobileParameters));
    } catch (error) {
      throw new Error(`Error running lighthouse (${error})`);
    }
    return;
  }

  /**
   * Provider Params
   */
  const {
    id,
    manifest: {
      context: { url },
    },
  } = playlist;

  try {
    /**
     * Run the Fargate tasks
     */
    const desktopParameters = buildParameters(CLUSTER!, TASK_DEFINITION!, subnets, SECURITY_GROUP!, CONTAINER_NAME!, url, id.toString(), true, 0);
    const mobileParameters = buildParameters(CLUSTER!, TASK_DEFINITION!, subnets, SECURITY_GROUP!, CONTAINER_NAME!, url, id.toString(), false, 0);
    await ecsClient.send(new RunTaskCommand(desktopParameters));
    await ecsClient.send(new RunTaskCommand(mobileParameters));
  } catch (error) {
    throw new Error(`Error running lighthouse (${error})`);
  }
};

export { main };
