import { Stack } from 'aws-cdk-lib';
import { createCluster } from './compute';
import { createTopics } from './events';
import { createSecurityGroup, createVpc } from './network';

const createCommonInfrastructure = (stack: Stack) => {
  /**
   * Create SNS Topics
   */
  const { triggerTopic } = createTopics(stack);

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
    triggerTopic,
    vpc,
    securityGroup,
    cluster,
    eip,
  };
};

export { createCommonInfrastructure };
