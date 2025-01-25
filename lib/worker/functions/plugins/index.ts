import { Stack } from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Cluster, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { createAutobahnSlackDeliveryLambda, createAutobahnStorageLambda } from './delivery';
import { createAutobahnLighthouseProviderLambda, createPageSpeedInsightsProviderLambda } from './provider';
import { createAdHocTriggerLambda } from './trigger';

const createPlugins = (
  stack: Stack,
  startPlaylistTopic: Topic,
  updatePlaylistTopic: Topic,
  pageSpeedInsightsTriggerTopic: Topic,
  serviceRole: IRole,
  observabilityBucket: Bucket,
  fargateTaskDefinition?: FargateTaskDefinition,
  cluster?: Cluster,
  securityGroup?: SecurityGroup,
  vpc?: IVpc
) => {
  /**
   * Trigger
   */
  createAdHocTriggerLambda(stack, startPlaylistTopic, serviceRole);

  /**
   * Provider
   */
  createPageSpeedInsightsProviderLambda(
    stack,
    updatePlaylistTopic,
    pageSpeedInsightsTriggerTopic,
    serviceRole,
    observabilityBucket
  );

  /**
   * Delivery
   */
  createAutobahnStorageLambda(stack, updatePlaylistTopic, serviceRole);
  createAutobahnSlackDeliveryLambda(stack, updatePlaylistTopic, serviceRole);

  /**
   * Provider
   */
  if (fargateTaskDefinition && cluster && securityGroup && vpc) {
    const { lighthouseProviderLambda } = createAutobahnLighthouseProviderLambda(
      stack,
      updatePlaylistTopic,
      serviceRole,
      observabilityBucket,
      fargateTaskDefinition,
      cluster,
      vpc,
      securityGroup
    );

    /**
     * Add environment variables to the Fargate task definition
     */
    lighthouseProviderLambda.grantInvoke(fargateTaskDefinition.taskRole);
    fargateTaskDefinition.grantRun(lighthouseProviderLambda);

    return { lighthouseProviderLambda };
  }

  return;
};

export { createPlugins };
