import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { randomUUID } from 'crypto';

const createBuckets = (stack: Stack) => {
  const observabilityBucket = new Bucket(stack, `${stack.stackName}ObservabilityBucket`, {
    bucketName: randomUUID(),
  });

  const frontendBucket = new Bucket(stack, `${stack.stackName}FrontendBucket`, {
    bucketName: randomUUID(),
  });

  return { observabilityBucket, frontendBucket };
};

export { createBuckets };
