import { Stack } from 'aws-cdk-lib';
import { createSecurityGroup, createVpc } from './network';

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
   * Return the common artifacts
   */
  return {
    vpc,
    securityGroup,
  };
};

export { createCommonInfrastructure };
