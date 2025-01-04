import { Duration, Stack } from 'aws-cdk-lib';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';

/**
 * Creates a Node.js Lambda function for AutobahnStorage.
 *
 * @param stack - The AWS CDK Stack in which the Lambda function will be created.
 * @returns An object containing the created Lambda function.
 */
const createAutobahnStorageLambda = (stack: Stack, updatePlaylistTopic: Topic, serviceRole: IRole) => {
  /**
   * Create a Systems Manager Parameter
   */
  const key = new Secret(stack, `${stack.stackName}AutobahnStoragePluginKey`, {
    secretName: 'autobahn/plugins/delivery/autobahn/key',
  });

  /**
   * Create AutobahnStorage Lambda
   */
  const autobahnStorageLambda = new NodejsFunction(stack, `${stack.stackName}AutobahnStoragePluginLambda`, {
    functionName: `${stack.stackName}AutobahnStoragePlugin`,
    entry: './lib/worker/functions/plugins/delivery/storage.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      UPDATE_PLAYLIST_TOPIC_ARN: updatePlaylistTopic.topicArn,
      KEY_ARN: key.secretArn,
      AWS_ACCOUNT_ID: stack.account,
    },
  });

  /**
   * Grant permissions to read the key
   */
  key.grantRead(autobahnStorageLambda);

  /**
   * Grant permissions to publish to the UpdatePlaylistTopic
   */
  updatePlaylistTopic.grantPublish(autobahnStorageLambda);

  /**
   * Grant permissions to invoke from service
   */
  autobahnStorageLambda.grantInvoke(serviceRole);

  return { autobahnStorageLambda };
};

const createAutobahnSlackDeliveryLambda = (stack: Stack, updatePlaylistTopic: Topic, serviceRole: IRole) => {
  /**
   * Create a Systems Manager Parameter
   */
  const key = new Secret(stack, `${stack.stackName}AutobahnSlackDeliveryPluginKey`, {
    secretName: 'autobahn/plugins/delivery/slack/key',
  });

  const slackUrl = new Secret(stack, `${stack.stackName}AutobahnSlackUrl`, {
    secretName: 'autobahn/plugins/delivery/slack/url',
  });

  /**
   * Create AutobahnSlackDelivery Lambda
   */
  const autobahnSlackDeliveryLambda = new NodejsFunction(stack, `${stack.stackName}AutobahnSlackDeliveryPluginLambda`, {
    functionName: `${stack.stackName}AutobahnSlackDeliveryPlugin`,
    entry: './lib/worker/functions/plugins/delivery/slack.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      UPDATE_PLAYLIST_TOPIC_ARN: updatePlaylistTopic.topicArn,
      SLACK_URL_ARN: slackUrl.secretArn,
      KEY_ARN: key.secretArn,
      AWS_ACCOUNT_ID: stack.account,
    },
  });

  /**
   * Grant permissions to read the key
   */
  slackUrl.grantRead(autobahnSlackDeliveryLambda);
  key.grantRead(autobahnSlackDeliveryLambda);

  /**
   * Grant permissions to publish to the UpdatePlaylistTopic
   */
  updatePlaylistTopic.grantPublish(autobahnSlackDeliveryLambda);

  /**
   * Grant permissions to invoke from service
   */
  autobahnSlackDeliveryLambda.grantInvoke(serviceRole);

  return { autobahnSlackDeliveryLambda };
};

export { createAutobahnStorageLambda, createAutobahnSlackDeliveryLambda };
