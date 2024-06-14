import { Stack } from 'aws-cdk-lib';
import { createCluster } from './compute';
import { createFargateTask } from './fargate';
import { createTriggerLambda } from './functions/trigger';
import { createSecurityGroup, createVpc } from './network';
import { createParameters } from './secrets';

const createWorkerInfrastructure = (stack: Stack, serverDnsName: string) => {
  /**
   * Create Secrets
   */
  const { urlParameter, apiKeyParameter } = createParameters(stack, serverDnsName);

  /**
   * Create VPC
   */
  const { vpc } = createVpc(stack);

  /**
   * Create Security Group
   */
  const { securityGroup } = createSecurityGroup(stack, vpc);

  /**
   * Create Cluster
   */
  const { cluster } = createCluster(stack, vpc);

  /**
   * Create Fargate Service
   */
  const { fargateTaskDefinition } = createFargateTask(stack);

  /**
   * Create Trigger Lambda
   */
  const triggerLambda = createTriggerLambda(stack, { urlParameter, apiKeyParameter }, fargateTaskDefinition, cluster, securityGroup);
};

export { createWorkerInfrastructure };
