import { Duration, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs/lib/function';

const createKickoffCacheLambda = (stack: Stack, dataAccessLambda: NodejsFunction, kickoffTable: Table) => {
  /**
   * Create Processing Lambda
   */
  const kickoffLambda = new NodejsFunction(stack, `${stack.stackName}KickoffCacheLambda`, {
    functionName: `${stack.stackName}KickoffCache`,
    entry: './lib/observability/functions/cache/kickoff.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    environment: {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      KICKOFF_TABLE_ARN: kickoffTable.tableArn,
    },
    memorySize: 1024,
  });

  return { kickoffLambda };
};

export { createKickoffCacheLambda };
