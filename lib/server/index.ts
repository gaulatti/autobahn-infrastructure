import { Stack } from 'aws-cdk-lib';
import { createFargateService } from './fargate';
import { createLoadBalancer } from './elb';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';

const createServerInfrastructure = (stack: Stack, vpc: Vpc, securityGroup: SecurityGroup, cluster: Cluster) => {
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
    serverDnsName: loadBalancer.loadBalancerDnsName,
  };
};

export { createServerInfrastructure };
