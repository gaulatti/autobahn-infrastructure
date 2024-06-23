import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { camelToKebab } from '../../common/utils';

const createBucket = (stack: Stack) => {
  const observabilityBucket = new Bucket(stack, `${stack.stackName}ObservabilityBucket`, {
    bucketName: camelToKebab(`${stack.stackName}ObservabilityBucket`),
  });

  return { observabilityBucket };
};

export { createBucket };
