import { Stack } from 'aws-cdk-lib';
import { AwsLogDriver, Cluster, ContainerImage, CpuArchitecture, FargateService, FargateTaskDefinition, OperatingSystemFamily } from 'aws-cdk-lib/aws-ecs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

/**
 * Creates a Fargate task definition with the specified stack and secrets.
 * @param stack - The CloudFormation stack.
 * @returns The Fargate task definition.
 */
const createFargateService = (stack: Stack, cluster: Cluster) => {

  /**
   * Represents the CloudWatch log group.
   */
  const logGroup = new LogGroup(stack, `${stack.stackName}LighthouseServerLogGroup`, {
    retention: RetentionDays.ONE_WEEK,
  });

  /**
   * Represents the log driver used by the Fargate service.
   */
  const logDriver = new AwsLogDriver({
    logGroup,
    streamPrefix: 'Lighthouse',
  });

  /**
   * Represents the Fargate task definition.
   */
  const fargateTaskDefinition = new FargateTaskDefinition(stack, `${stack.stackName}LighthouseServerFargateTask`, {
    cpu: 4096,
    memoryLimitMiB: 8192,
    runtimePlatform: { cpuArchitecture: CpuArchitecture.X86_64, operatingSystemFamily: OperatingSystemFamily.LINUX },
  });

  /**
   * Adds a container to the Fargate task definition.
   */
  fargateTaskDefinition.addContainer(`${stack.stackName}LighthouseServerFargateContainer`, {
    containerName: `${stack.stackName}LighthouseServerFargateContainer`,
    image: ContainerImage.fromAsset('./lib/server/assets'),
    logging: logDriver,
  });

  /**
   * Represents the Fargate service.
   */
  const fargateService = new FargateService(stack, `${stack.stackName}LighthouseFargateService`, {
    cluster,
    taskDefinition: fargateTaskDefinition,
    desiredCount: 1,
  });

  return { fargateService };
};

export { createFargateService };
