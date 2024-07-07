import { Stack } from 'aws-cdk-lib';
import { createFargateTask } from './fargate';
import { createTriggerLambda } from './functions/trigger';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { createTopics } from './events';

/**
 * Creates the worker infrastructure.
 *
 * @param stack - The CloudFormation stack.
 * @param securityGroup - The security group.
 * @param cluster - The ECS (Elastic Container Service) cluster.
 * @param serverDnsName - The DNS name of the server.
 * @param observabilityBucket - The bucket for observability.
 */
const createWorkerInfrastructure = (stack: Stack, securityGroup: SecurityGroup, cluster: Cluster, serverDnsName: string, observabilityBucket: Bucket) => {
  /**
   * Create SNS Topics
   */
  const { triggerTopic } = createTopics(stack);

  /**
   * Create Fargate Service
   *
   * Important: This needs to be deployed from a x64 machine (e.g. EC2) because the Docker image is built for x64.
   *
   * Chrome is not available for ARM64 yet in a headless mode, so we're forced to use x64. This is a limitation of the
   * current version of Chrome.
   *
   * Said that, this can be directly deployed by CLI from local if the computer is x64. Hence, it'll be needed to
   * create a CodeBuild Project and deploy this CDK project from there.
   */
  const { fargateTaskDefinition } = createFargateTask(stack, observabilityBucket);

  /**
   * Create Trigger Lambda
   */
  const triggerLambda = createTriggerLambda(stack, serverDnsName, fargateTaskDefinition, cluster, securityGroup, triggerTopic);
};

export { createWorkerInfrastructure };
