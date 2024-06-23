import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

const createBucket = (stack: Stack) => {
  const observabilityBucket = new Bucket(stack, `${stack.stackName}ObservabilityBucket`, {
    bucketName: `${stack.stackName}ObservabilityBucket`,
  });

  return { observabilityBucket };
};

export { createBucket };
