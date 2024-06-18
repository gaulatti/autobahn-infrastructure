import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { randomUUID } from 'crypto';

/**
 * Creates an S3 bucket to store the React Assets.
 *
 * @param stack - The AWS CloudFormation stack.
 * @returns The created S3 bucket.
 */
const createBucket = (stack: Stack) => {
  /**
   * Represents the S3 bucket to store the React Assets.
   */
  const bucket = new Bucket(stack, `${stack.stackName}Bucket`, {
    bucketName: randomUUID(),
    versioned: true,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  });

  /**
   * Upload the index file to the S3 bucket.
   */
  const asset = Source.asset('./lib/target/assets');
  const assetDeployment = new BucketDeployment(stack, `${stack.stackName}BucketDeployment`, {
    sources: [asset],
    destinationBucket: bucket,
  });

  return { bucket };
};

export { createBucket };
