import { Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../common/utils/api';

const createKickoffCacheLambda = (stack: Stack, dataAccessLambda: NodejsFunction, kickoffTable: Table) => {
  /**
   * Create Processing Lambda
   */
  const kickoffCacheLambda = new NodejsFunction(stack, `${stack.stackName}KickoffCacheLambda`, {
    ...buildLambdaSpecs(stack, 'KickoffCache', './lib/observability/functions/cache/kickoff.src.ts', {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      KICKOFF_TABLE_NAME: kickoffTable.tableName,
    }),
  });

  dataAccessLambda.grantInvoke(kickoffCacheLambda);
  kickoffTable.grantReadWriteData(kickoffCacheLambda);

  return { kickoffCacheLambda };
};

export { createKickoffCacheLambda };
