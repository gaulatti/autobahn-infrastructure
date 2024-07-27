import { Duration, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

/**
 * Creates a processing Lambda function for handling S3 events.
 * @param stack - The AWS CloudFormation stack.
 * @param bucket - The S3 bucket to process events from.
 * @param dataAccessLambda - The data access Lambda function.
 * @returns An object containing the processing Lambda function.
 */
const createProcessingLambda = (stack: Stack, observabilityBucket: Bucket, dataAccessLambda: NodejsFunction) => {
  /**
   * Create Processing Lambda
   */
  const processingLambda = new NodejsFunction(stack, `${stack.stackName}ProcessingLambda`, {
    functionName: `${stack.stackName}Processing`,
    entry: './lib/observability/functions/processing/index.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    environment: {
      BUCKET_NAME: observabilityBucket.bucketName,
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    },
    memorySize: 1024,
  });

  /**
   * Grant Permissions for reading from the bucket and posting to CloudWatch
   */
  observabilityBucket.grantReadWrite(processingLambda);
  processingLambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['cloudwatch:PutMetricData'],
      resources: ['*'],
    })
  );

  /**
   * Add S3 Event Notification. This will trigger the Lambda function when an object is created in the bucket.
   */
  observabilityBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(processingLambda));

  /**
   * Allow this lambda to save the metrics in the Database.
   */
  dataAccessLambda.grantInvoke(processingLambda);

  return { processingLambda };
};

export { createProcessingLambda };
