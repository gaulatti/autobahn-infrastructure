import { Stack } from 'aws-cdk-lib';
import { createSecurityGroup, createVpc } from './network';
import { createCluster } from './compute';
import { createFargateService } from './fargate';
import { createLoadBalancer } from './elb';
import { CfnEIP } from 'aws-cdk-lib/aws-ec2';

const createTargetInfrastructure = (stack: Stack, eip: CfnEIP) => {
  /**
   * Create VPC
   */
  const { vpc } = createVpc(stack);

  /**
   * Create Security Group
   */
  const { securityGroup } = createSecurityGroup(stack, vpc, eip);

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
