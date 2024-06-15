import { Stack } from 'aws-cdk-lib';
import { CfnEIP, NatProvider, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';

/**
 * Creates a VPC (Virtual Private Cloud) for the given stack.
 * @param stack - The stack in which the VPC will be created.
 * @returns An object containing the created VPC.
 */
const createVpc = (stack: Stack) => {
  /**
   * Represents the Elastic IP address.
   */
  const eip = new CfnEIP(stack, `${stack.stackName}NATIP`);

  /**
   * Represents the VPC (Virtual Private Cloud).
   */
  const vpc = new Vpc(stack, `${stack.stackName}CommonVPC`, {
    vpcName: `${stack.stackName}VPC`,
    maxAzs: 2,
    natGateways: 1,
    subnetConfiguration: [
      {
        name: `${stack.stackName}PublicSubnet`,
        subnetType: SubnetType.PUBLIC,
      },
      {
        name: `${stack.stackName}PrivateSubnet`,
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    ],

    /**
     * Represents the NAT gateway provider.
     * Useful to allowlist all Lighthouse traffic through the NAT gateway.
     */
    natGatewayProvider: NatProvider.gateway({
      eipAllocationIds: [eip.attrAllocationId],
    }),
  });

  return { vpc, eip };
};

/**
 * Creates a security group for the server.
 *
 * @param stack - The CloudFormation stack.
 * @param vpc - The VPC to associate the security group with.
 * @returns An object containing the created security group.
 */
const createSecurityGroup = (stack: Stack, vpc: Vpc) => {
  const securityGroup = new SecurityGroup(stack, `${stack.stackName}CommonSecurityGroup`, {
    vpc,
    securityGroupName: `${stack.stackName}CommonSecurityGroup`,
  });

  return { securityGroup };
};

export { createSecurityGroup, createVpc };

