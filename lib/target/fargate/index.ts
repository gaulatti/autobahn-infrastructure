import { Stack } from 'aws-cdk-lib';
import {
  AwsLogDriver,
  Cluster,
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  OperatingSystemFamily,
  Protocol,
} from 'aws-cdk-lib/aws-ecs';
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
  const logGroup = new LogGroup(stack, `${stack.stackName}TargetLogGroup`, {
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
  const fargateTaskDefinition = new FargateTaskDefinition(stack, `${stack.stackName}TargetFargateTask`, {
    cpu: 4096,
    memoryLimitMiB: 8192,
    runtimePlatform: { cpuArchitecture: CpuArchitecture.X86_64, operatingSystemFamily: OperatingSystemFamily.LINUX },
  });

  /**
   * Adds a container to the Fargate task definition.
   */
  fargateTaskDefinition.addContainer(`${stack.stackName}TargetFargateContainer`, {
    containerName: `${stack.stackName}TargetFargateContainer`,
    image: ContainerImage.fromAsset('./lib/target/assets'),
    logging: logDriver,
    portMappings: [{ containerPort: 8080, protocol: Protocol.TCP }],
  });

  /**
   * Represents the Fargate service.
   */
  const fargateService = new FargateService(stack, `${stack.stackName}TargetFargateService`, {
    cluster,
    taskDefinition: fargateTaskDefinition,
    desiredCount: 1,
  });

  return { fargateService };
};

export { createFargateService };
