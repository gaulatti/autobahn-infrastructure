import { Stack } from 'aws-cdk-lib';
import { createFargateTask } from './fargate';
import { createTriggerLambda } from './functions/trigger';
import { createParameters } from './secrets';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';

const createWorkerInfrastructure = (stack: Stack, vpc: Vpc, securityGroup: SecurityGroup, cluster: Cluster, serverDnsName: string, targetDnsName: string) => {
  /**
   * Create Secrets
   */
  const { apiKeyParameter } = createParameters(stack);

  /**
   * Create Fargate Service
   */
  const { fargateTaskDefinition } = createFargateTask(stack);

  /**
   * Create Trigger Lambda
   */
  const triggerLambda = createTriggerLambda(stack, serverDnsName, targetDnsName, apiKeyParameter, fargateTaskDefinition, cluster, securityGroup);
};

export { createWorkerInfrastructure };
