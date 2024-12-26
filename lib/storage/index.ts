import { Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';

/**
 * Creates buckets for the stack.
 *
 * @param stack - The stack object.
 * @returns An object containing the created buckets.
 */
const createBuckets = (stack: Stack) => {
  /**
   * Observability Bucket
   */
  const observabilityBucket = new Bucket(stack, `${stack.stackName}ObservabilityBucket`, {
    bucketName: `${stack.stackName.toLowerCase()}-observability`,
  });

  /**
   * Assets Bucket
   */
  const assetsBucket = new Bucket(stack, `${stack.stackName}AssetsBucket`, {
    bucketName: `${stack.stackName.toLowerCase()}-assets`,
  });

  /**
   * Frontend Bucket
   */
  const frontendBucket = new Bucket(stack, `${stack.stackName}FrontendBucket`, {
    bucketName: `${stack.stackName.toLowerCase()}-frontend`,
  });

  return { observabilityBucket, assetsBucket, frontendBucket };
};

export { createBuckets };
