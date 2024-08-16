import { Stack } from 'aws-cdk-lib';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { createFargateTask } from './fargate';
import { createTriggerLambda } from './functions/trigger';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates the worker infrastructure.
 *
 * @param stack - The CloudFormation stack.
 * @param securityGroup - The security group.
 * @param cluster - The ECS (Elastic Container Service) cluster.
 * @param serverDnsName - The DNS name of the server.
 * @param observabilityBucket - The bucket for observability.
 * @param triggerTopic - The SNS (Simple Notification Service) topic for triggering the worker.
 * @param failureHandlerLambda - The Lambda function to handle failures.
 */
const createWorkerInfrastructure = (stack: Stack, securityGroup: SecurityGroup, cluster: Cluster, observabilityBucket: Bucket, triggerTopic: Topic, failureHandlerLambda: NodejsFunction) => {
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
  const { fargateTaskDefinition } = createFargateTask(stack, observabilityBucket, failureHandlerLambda);

  /**
   * Create Trigger Lambda
   */
  const triggerLambda = createTriggerLambda(stack, fargateTaskDefinition, cluster, securityGroup, triggerTopic, observabilityBucket);
};

export { createWorkerInfrastructure };
