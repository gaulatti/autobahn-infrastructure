import { Stack } from 'aws-cdk-lib';
import { createSecurityGroup, createVpc } from './network';
import { createCluster } from './compute';

const createCommonInfrastructure = (stack: Stack) => {
  /**
   * Create VPC
   */
  const { vpc, eip } = createVpc(stack);

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
    eip
  };
};

export { createCommonInfrastructure };
