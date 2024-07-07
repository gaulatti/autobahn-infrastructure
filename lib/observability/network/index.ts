import { Stack } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontWebDistribution, OriginAccessIdentity, ViewerCertificate } from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

/**
 * Creates a CloudFront distribution for the specified stack and S3 bucket.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param bucket - The S3 bucket to be used as the origin source.
 * @returns The created CloudFront distribution.
 */
const createDistribution = (stack: Stack, s3BucketSource: Bucket, certificateArnSecret: Secret, frontendFqdnSecret: Secret) => {
  /**
   * The domain name to be used for the CloudFront distribution.
   */
  const certificate = Certificate.fromCertificateArn(stack, `${stack.stackName}Certificate`, certificateArnSecret.secretValue.unsafeUnwrap());

  /**
   * Represents the CloudFront Origin Access Identity (OAI).
   */
  const originAccessIdentity = new OriginAccessIdentity(stack, `${stack.stackName}DistributionOAI`);

  /**
   * Grants read permissions to the CloudFront Origin Access Identity (OAI).
   */
  s3BucketSource.grantRead(originAccessIdentity);

  /**
   * Represents the CloudFront distribution to serve the React Assets.
   */
  const distribution = new CloudFrontWebDistribution(stack, `${stack.stackName}Distribution`, {
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource,
          originAccessIdentity,
        },
        behaviors: [{ isDefaultBehavior: true }],
      },
    ],
    viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
      aliases: [frontendFqdnSecret.secretValue.unsafeUnwrap()],
    }),
    errorConfigurations: [
      {
        errorCode: 404,
        responsePagePath: '/index.html',
        responseCode: 200,
        errorCachingMinTtl: 0,
      },
    ],
  });

  return { distribution };
};

export { createDistribution };
