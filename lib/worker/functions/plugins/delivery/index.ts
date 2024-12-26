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

export { createAutobahnStorageLambda };
