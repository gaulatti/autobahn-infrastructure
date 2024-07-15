import { Duration, Stack } from 'aws-cdk-lib';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates a target lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param observabilityBucket - The S3 bucket for observability.
 * @param dataAccessLambda - The data access lambda function.
 * @returns An object containing the target lambda function.
 */
const createTargetLambda = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  /**
   * Create Processing Lambda
   */
  const targetLambda = new NodejsFunction(stack, `${stack.stackName}TargetLambda`, {
    functionName: `${stack.stackName}Target`,
    entry: './lib/observability/functions/api/target.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    tracing: Tracing.ACTIVE,
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
    },
    memorySize: 1024,
  });

  /**
   * Allow this lambda to save the metrics in the Database.
   */
  dataAccessLambda.grantInvoke(targetLambda);

  return { targetLambda };
};

export { createTargetLambda };
