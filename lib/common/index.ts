import { Stack } from 'aws-cdk-lib';
import { createSecurityGroup, createVpc } from './network';
import { createCluster } from './compute';

const createCommonInfrastructure = (stack: Stack) => {
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
   * Return the common artifacts
   */
  return {
    vpc,
    securityGroup,
    cluster,
  };
};

export { createCommonInfrastructure };
