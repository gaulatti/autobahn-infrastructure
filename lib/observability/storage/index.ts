import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

const createBuckets = (stack: Stack) => {
  const observabilityBucket = new Bucket(stack, `${stack.stackName}ObservabilityBucket`, {
    bucketName: `${stack.stackName.toLowerCase()}-observability`,
  });

  const frontendBucket = new Bucket(stack, `${stack.stackName}FrontendBucket`, {
    bucketName: `${stack.stackName.toLowerCase()}-frontend`,
  });

  return { observabilityBucket, frontendBucket };
};

export { createBuckets };
