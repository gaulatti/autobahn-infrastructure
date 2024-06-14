import { Stack } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';

/**
 * Creates a VPC (Virtual Private Cloud) for the given stack.
 * @param stack - The stack in which the VPC will be created.
 * @returns An object containing the created VPC.
 */
const createVpc = (stack: Stack) => {
  const vpc = new Vpc(stack, `${stack.stackName}ServerVPC`, {
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
const createSecurityGroup = (stack: Stack, vpc: Vpc) => {
  const securityGroup = new SecurityGroup(stack, `${stack.stackName}ServerSecurityGroup`, {
    vpc,
    securityGroupName: `${stack.stackName}ServerSecurityGroup`,
  });

  return { securityGroup };
};

export { createVpc, createSecurityGroup };