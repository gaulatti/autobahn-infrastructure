import { Duration, Stack } from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Cluster, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

/**
 * Creates a Lambda function for the Autobahn Lighthouse Provider.
 *
 * @param {Stack} stack - The AWS CDK stack in which the Lambda function will be created.
 * @returns {Object} An object containing the created Lambda function.
 * @returns {NodejsFunction} return.lighthouseProviderLambda - The created Node.js Lambda function.
 */
const createAutobahnLighthouseProviderLambda = (
  stack: Stack,
  updatePlaylistTopic: Topic,
  serviceRole: IRole,
  observabilityBucket: Bucket,
  fargateTaskDefinition: FargateTaskDefinition,
  cluster: Cluster,
  vpc: IVpc,
  securityGroup: SecurityGroup
) => {
  /**
   * Create a Systems Manager Parameter
   */
  const key = new Secret(stack, `${stack.stackName}InternalLighthouseProviderPluginKey`, {
    secretName: 'autobahn/plugins/provider/internal-lighthouse/key',
  });

  /**
   * Create AutobahnLighthouseProvider Lambda
   */
  const lighthouseProviderLambda = new NodejsFunction(stack, `${stack.stackName}InternalLighthouseProviderPluginLambda`, {
    functionName: `${stack.stackName}InternalLighthouseProviderPlugin`,
    entry: './lib/worker/functions/plugins/provider/lighthouse.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      UPDATE_PLAYLIST_TOPIC_ARN: updatePlaylistTopic.topicArn,
      SUBNETS: vpc.privateSubnets.map((subnet) => subnet.subnetId).join(','),
      SECURITY_GROUP: securityGroup.securityGroupId,
      CLUSTER: cluster.clusterArn,
      TASK_DEFINITION: fargateTaskDefinition.taskDefinitionArn,
      CONTAINER_NAME: fargateTaskDefinition.defaultContainer!.containerName,
      BUCKET_NAME: observabilityBucket.bucketName,
      SEGUE_ARN: `arn:aws:lambda:${stack.region}:${stack.account}:function:${stack.stackName}InternalLighthouseProviderPlugin`,
      KEY_ARN: key.secretArn,
    },
  });

  /**
   * Grant permissions to read the key
   */
  key.grantRead(lighthouseProviderLambda);

  /**
   * Grant permissions to publish to the UpdatePlaylistTopic
   */
  updatePlaylistTopic.grantPublish(lighthouseProviderLambda);

  /**
   * Grant permissions to invoke from service
   */
  lighthouseProviderLambda.grantInvoke(serviceRole);

  /**
   * Grant permissions to read from the observability bucket
   */
  observabilityBucket.grantRead(lighthouseProviderLambda);

  return { lighthouseProviderLambda };
};

/**
 * Creates a Lambda function for the PageSpeedInsights Provider.
 *
 * @param {Stack} stack - The AWS CDK stack in which the Lambda function will be created.
 * @returns {Object} An object containing the created Lambda function.
 * @returns {NodejsFunction} return.pageSpeedInsightsProviderLambda - The created Node.js Lambda function.
 */
const createPageSpeedInsightsProviderLambda = (
  stack: Stack,
  updatePlaylistTopic: Topic,
  pageSpeedInsightsTriggerTopic: Topic,
  serviceRole: IRole,
  observabilityBucket: Bucket
) => {
  /**
   * Create a Systems Manager Parameter
   */
  const key = new Secret(stack, `${stack.stackName}PageSpeedInsightsProviderPluginKey`, {
    secretName: 'autobahn/plugins/provider/pageSpeedInsights/key',
  });

  /**
   * Create AutobahnPageSpeedInsightsProvider Lambda
   */
  const pageSpeedInsightsProviderLambda = new NodejsFunction(stack, `${stack.stackName}PageSpeedInsightsProviderPluginLambda`, {
    functionName: `${stack.stackName}PageSpeedInsightsProviderPlugin`,
    entry: './lib/worker/functions/plugins/provider/psi/index.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      UPDATE_PLAYLIST_TOPIC_ARN: updatePlaylistTopic.topicArn,
      TRIGGER_TOPIC_ARN: pageSpeedInsightsTriggerTopic.topicArn,
      BUCKET_NAME: observabilityBucket.bucketName,
      KEY_ARN: key.secretArn,
    },
  });

  /**
   * Create AutobahnPageSpeedInsightsProvider Worker Lambda
   */
  const workerLambda = new NodejsFunction(stack, `${stack.stackName}PageSpeedInsightsWorkerLambda`, {
    functionName: `${stack.stackName}PageSpeedInsightsProviderWorker`,
    entry: './lib/worker/functions/plugins/provider/psi/worker.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(15),
    tracing: Tracing.ACTIVE,
    memorySize: 1024,
    environment: {
      BUCKET_NAME: observabilityBucket.bucketName,
      SEGUE_ARN: `arn:aws:lambda:${stack.region}:${stack.account}:function:${stack.stackName}PageSpeedInsightsProviderPlugin`,
    },
  });

  /**
   * Grant permissions to have cross-comunication between the two Lambdas
   */
  pageSpeedInsightsTriggerTopic.grantPublish(pageSpeedInsightsProviderLambda);
  pageSpeedInsightsProviderLambda.grantInvoke(workerLambda);

  /**
   * Add a subscription to the PageSpeedInsightsTriggerTopic
   */
  pageSpeedInsightsTriggerTopic.addSubscription(new LambdaSubscription(workerLambda));

  /**
   * Grant permissions to read the key
   */
  key.grantRead(pageSpeedInsightsProviderLambda);

  /**
   * Grant permissions to publish to the UpdatePlaylistTopic
   */
  updatePlaylistTopic.grantPublish(pageSpeedInsightsProviderLambda);

  /**
   * Grant permissions to invoke from service
   */
  pageSpeedInsightsProviderLambda.grantInvoke(serviceRole);

  /**
   * Grant permissions to read from the observability bucket
   */
  observabilityBucket.grantReadWrite(pageSpeedInsightsProviderLambda);
  observabilityBucket.grantWrite(workerLambda);

  return { pageSpeedInsightsProviderLambda };
};

export { createAutobahnLighthouseProviderLambda, createPageSpeedInsightsProviderLambda };
