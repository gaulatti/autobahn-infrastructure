import { Stack } from 'aws-cdk-lib';
import { createSecurityGroup, createVpc } from './network';
import { createCluster } from './compute';
import { createFargateService } from './fargate';
import { createLoadBalancer } from './elb';

const createTargetInfrastructure = (stack: Stack) => {
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

  /**
   * Create Load Balancer
   */
  const { loadBalancer } = createLoadBalancer(stack, fargateService, vpc, securityGroup);

  /**
   * Return the DNS name of the load balancer
   */
  return {
    targetDnsName: loadBalancer.loadBalancerDnsName,
  };
};

export { createTargetInfrastructure };
