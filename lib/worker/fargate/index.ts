import { Stack } from 'aws-cdk-lib';
import { AwsLogDriver, ContainerImage, CpuArchitecture, FargateTaskDefinition, OperatingSystemFamily } from 'aws-cdk-lib/aws-ecs';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

/**
 * Creates a Fargate task definition with the specified stack and secrets.
 * @param stack - The CloudFormation stack.
 * @returns The Fargate task definition.
 */
const createFargateTask = (stack: Stack, observabilityBucket: Bucket) => {
  /**
   * Represents the CloudWatch log group.
   */
  const logGroup = new LogGroup(stack, `${stack.stackName}WorkerLogGroup`, {
    logGroupName: `${stack.stackName}Worker`,
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
  const fargateTaskDefinition = new FargateTaskDefinition(stack, `${stack.stackName}WorkerFargateTask`, {
    cpu: 4096,
    memoryLimitMiB: 8192,
    runtimePlatform: { cpuArchitecture: CpuArchitecture.X86_64, operatingSystemFamily: OperatingSystemFamily.LINUX },
  });

  /**
   * Grants the Fargate task permission to write to the observability bucket.
   */
  observabilityBucket.grantWrite(fargateTaskDefinition.taskRole);

  /**
   * Adds a container to the Fargate task definition.
   */
  fargateTaskDefinition.addContainer(`${stack.stackName}WorkerFargateContainer`, {
    containerName: `${stack.stackName}Worker`,
    image: ContainerImage.fromAsset('./lib/worker/assets'),
    logging: logDriver,
    environment: {
      BUCKET_NAME: observabilityBucket.bucketName,
    }
  });

  return { fargateTaskDefinition };
};

export { createFargateTask };
