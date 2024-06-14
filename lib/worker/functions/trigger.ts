import { Duration, Stack } from 'aws-cdk-lib';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Cluster, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

/**
 * Creates a trigger Lambda function for the specified stack.
 * @param stack - The stack where the trigger Lambda function will be created.
 * @param parameters - The parameters used by the Fargate service.
 * @param fargateTaskDefinition - The Fargate task definition.
 * @param cluster - The cluster where the Fargate service is running.
 * @param securityGroup - The security group associated with the Fargate service.
 * @returns An object containing the created trigger Lambda function.
 */
const createTriggerLambda = (
  stack: Stack,
  serverDnsName: string,
  targetDnsName: string,
  apiKeyParameter: StringParameter,
  fargateTaskDefinition: FargateTaskDefinition,
  cluster: Cluster,
  securityGroup: SecurityGroup
) => {
  /**
   * Represents the trigger Lambda function specification.
   */
  const triggerLambdaSpec = {
    functionName: `${stack.stackName}Trigger`,
    entry: './lib/worker/functions/trigger.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    environment: {
      URL_PARAMETER: serverDnsName,
      TARGET_PARAMETER: targetDnsName,
      API_KEY_PARAMETER: apiKeyParameter.stringValue,
      SUBNETS: cluster.vpc.privateSubnets.map((subnet) => subnet.subnetId).join(','),
      SECURITY_GROUP: securityGroup.securityGroupId,
      CLUSTER: cluster.clusterArn,
      TASK_DEFINITION: fargateTaskDefinition.taskDefinitionArn,
      CONTAINER_NAME: fargateTaskDefinition.defaultContainer!.containerName,
    },
  };

  /**
   * Represents the trigger Lambda function.
   */
  const triggerLambda = new NodejsFunction(stack, `${triggerLambdaSpec.functionName}Lambda`, triggerLambdaSpec);
  fargateTaskDefinition.grantRun(triggerLambda);


  /**
   * Represents the rule that triggers the Lambda function.
   */
  const eventRule = new Rule(stack, `${triggerLambdaSpec.functionName}Rule`, {
    schedule: Schedule.rate(Duration.minutes(1)),
  });

  /**
   * Adds the Lambda function as a target for the rule.
   */
  eventRule.addTarget(new LambdaFunction(triggerLambda));

  return { triggerLambda };
};

export { createTriggerLambda };
