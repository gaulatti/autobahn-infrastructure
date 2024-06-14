import { Stack } from 'aws-cdk-lib';
import { createSecurityGroup, createVpc } from './network';
import { createCluster } from './compute';
import { createFargateService } from './fargate';

const createServerInfrastructure = (stack: Stack) => {
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
  const { fargateService } = createFargateService(stack, cluster);
};

export { createServerInfrastructure };