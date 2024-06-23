import { Stack } from 'aws-cdk-lib';
import { createFargateTask } from './fargate';
import { createTriggerLambda } from './functions/trigger';
import { createParameters } from './parameters';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

/**
 * Creates the worker infrastructure.
 *
 * @param stack - The CloudFormation stack.
 * @param vpc - The VPC (Virtual Private Cloud).
 * @param securityGroup - The security group.
 * @param cluster - The ECS (Elastic Container Service) cluster.
 * @param serverDnsName - The DNS name of the server.
 * @param observabilityBucket - The bucket for observability.
 */
const createWorkerInfrastructure = (stack: Stack, vpc: Vpc, securityGroup: SecurityGroup, cluster: Cluster, serverDnsName: string, observabilityBucket: Bucket) => {
  /**
   * Create Secrets
   */
  const { apiKeyParameter } = createParameters(stack);

  /**
   * Create Fargate Service
   */
  const { fargateTaskDefinition } = createFargateTask(stack, observabilityBucket);

  /**
   * Create Trigger Lambda
   */
  const triggerLambda = createTriggerLambda(stack, serverDnsName, apiKeyParameter, fargateTaskDefinition, cluster, securityGroup);
};

export { createWorkerInfrastructure };
