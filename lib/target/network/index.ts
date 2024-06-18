import { Stack } from 'aws-cdk-lib';
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  LambdaEdgeEventType,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { CfnEIP } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime, Version } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';

const createDistribution = (stack: Stack, s3BucketSource: Bucket, ip: CfnEIP) => {
  /**
   * Represents the CloudFront Origin Access Identity (OAI).
   */
  const originAccessIdentity = new OriginAccessIdentity(stack, `${stack.stackName}DistributionOAI`);

  /**
   * Grants read permissions to the CloudFront Origin Access Identity (OAI).
   */
  s3BucketSource.grantRead(originAccessIdentity);

  /**
   * Create a Log Group for the Lambda@Edge function
   */
  const logGroup = new LogGroup(stack, `${stack.stackName}AuthorizationLogGroup`, {
    logGroupName: `/aws/lambda/${stack.stackName}Authorization`,
    retention: RetentionDays.ONE_WEEK,
  });

  /**
   * Create a Role for the Lambda@Edge function
   */
  const lambdaRole = new Role(stack, 'LambdaEdgeRole', {
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
  });

  /**
   * Grants permissions to the Lambda@Edge function to write logs
   */
  const logPolicy = new PolicyStatement({
    actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
    resources: [`${logGroup.logGroupArn}:*`],
  });

  /**
   * Attach the policy to the Lambda@Edge function
   */
  lambdaRole.addToPolicy(logPolicy);

  /**
   * Create a Lambda@Edge function to restrict access by IP
   */
  const lambdaFunction = new Function(stack, `${stack.stackName}AuthorizationFunction`, {
    functionName: `${stack.stackName}Authorization`,
    runtime: Runtime.NODEJS_20_X,
    handler: 'index.handler',
    role: lambdaRole,
    logRetention: RetentionDays.ONE_WEEK,
    code: Code.fromInline(`
      exports.handler = async (event) => {
        const request = event.Records[0].cf.request;
        const ip = request.clientIp;
        const allowedIp = '${ip.attrPublicIp}';

        if (ip !== allowedIp) {
        console.log('Access denied');
          return {
            status: '403',
            statusDescription: 'Forbidden',
          };
        }

        return request;

      };
    `),
  });

  /**
   * Represents the CloudFront distribution to serve the React Assets.
   */
  const distribution = new CloudFrontWebDistribution(stack, `${stack.stackName}`, {
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource,
          originAccessIdentity,
        },
        behaviors: [
          {
            isDefaultBehavior: true,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
            lambdaFunctionAssociations: [
              {
                eventType: LambdaEdgeEventType.VIEWER_REQUEST,
                lambdaFunction: lambdaFunction.currentVersion,
              },
            ],
          },
        ],
      },
    ],
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
