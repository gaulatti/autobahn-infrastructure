import { Duration, Stack } from 'aws-cdk-lib';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates a team lambda function.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param observabilityBucket - The S3 bucket for observability.
 * @param dataAccessLambda - The data access lambda function.
 * @returns An object containing the team lambda function.
 */
const createTeamLambda = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  /**
   * Create Processing Lambda
   */
  const teamLambda = new NodejsFunction(stack, `${stack.stackName}TeamLambda`, {
    functionName: `${stack.stackName}Team`,
    entry: './lib/observability/functions/api/team.src.ts',
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
  dataAccessLambda.grantInvoke(teamLambda);

  return { teamLambda };
};

export { createTeamLambda };
