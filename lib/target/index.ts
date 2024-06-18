import { Stack } from 'aws-cdk-lib';
import { CfnEIP } from 'aws-cdk-lib/aws-ec2';
import { createDistribution } from './network';
import { createBucket } from './storage';

const createTargetInfrastructure = (stack: Stack, eip: CfnEIP) => {
  /**
   * Create S3 Bucket
   */
  const { bucket } = createBucket(stack);

  /**
   * Create CloudFront Distribution
   */
  const { distribution } = createDistribution(stack, bucket, eip);

  /**
   * Return the DNS name of the load balancer
   */
  return {
    targetDnsName: distribution.distributionDomainName,
  };
};

export { createTargetInfrastructure };
