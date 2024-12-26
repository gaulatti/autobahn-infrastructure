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
const createAdHocTriggerLambda = (stack: Stack, startPlaylistTopic: Topic, serviceRole: IRole) => {
  /**
   * Create a Systems Manager Parameter
   */
  const key = new Secret(stack, `${stack.stackName}AdHocTriggerPluginKey`, {
    secretName: 'autobahn/plugins/trigger/adhoc/key',
  });

  /**
   * Create AdHocTrigger Lambda
   */
  const adhocTriggerLambda = new NodejsFunction(stack, `${stack.stackName}AdHocTriggerPluginLambda`, {
    functionName: `${stack.stackName}AdHocTriggerPlugin`,
    entry: './lib/worker/functions/plugins/trigger/adhoc.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      START_PLAYLIST_TOPIC_ARN: startPlaylistTopic.topicArn,
      KEY_ARN: key.secretArn,
    },
  });

  /**
   * Grant permissions to read the key
   */
  key.grantRead(adhocTriggerLambda);

  /**
   * Grant permissions to the Lambda function to publish to the startPlaylistTopic.
   */
  startPlaylistTopic.grantPublish(adhocTriggerLambda);

  /**
   * Grant permissions to invoke from service
   */
  adhocTriggerLambda.grantInvoke(serviceRole);

  return { adhocTriggerLambda };
};

export { createAdHocTriggerLambda };
