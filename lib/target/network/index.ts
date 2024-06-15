import { Stack } from 'aws-cdk-lib';
import { CfnEIP, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';

/**
 * Creates a VPC (Virtual Private Cloud) for the given stack.
 * @param stack - The stack in which the VPC will be created.
 * @returns An object containing the created VPC.
 */
const createVpc = (stack: Stack) => {
  const vpc = new Vpc(stack, `${stack.stackName}TargetVPC`, {
    vpcName: `${stack.stackName}VPC`,
    maxAzs: 2,
  });

  return { vpc };
};

/**
 * Creates a security group for the server.
 *
 * @param stack - The CloudFormation stack.
 * @param vpc - The VPC to associate the security group with.
 * @returns An object containing the created security group.
 */
const createSecurityGroup = (stack: Stack, vpc: Vpc, eip: CfnEIP) => {
  const securityGroup = new SecurityGroup(stack, `${stack.stackName}TargetSecurityGroup`, {
    vpc,
    securityGroupName: `${stack.stackName}TargetSecurityGroup`,
  });

  securityGroup.addIngressRule(
    Peer.ipv4(`${eip.ref}/32`),
    Port.tcp(80),
    'Allow inbound HTTP traffic from Lighthouse'
  );

  return { securityGroup };
};

export { createVpc, createSecurityGroup };
