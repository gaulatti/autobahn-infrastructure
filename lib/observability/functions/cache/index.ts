import { Duration, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { buildLambdaSpecs } from '../../../common/utils/api';

const createKickoffCacheLambda = (stack: Stack, dataAccessLambda: NodejsFunction, cacheTable: Table) => {
  /**
   * Create Processing Lambda
   */
  const kickoffCacheLambda = new NodejsFunction(stack, `${stack.stackName}KickoffCacheLambda`, {
    tracing: Tracing.ACTIVE,
    ...buildLambdaSpecs(stack, 'KickoffCache', './lib/observability/functions/cache/kickoff.src.ts', {
      DATA_ACCESS_ARN: dataAccessLambda.functionArn,
      CACHE_TABLE_NAME: cacheTable.tableName,
    }),
  });

  dataAccessLambda.grantInvoke(kickoffCacheLambda);
  cacheTable.grantReadWriteData(kickoffCacheLambda);

  /**
   * Keep Lambdas Warm
   */
  const rule = new Rule(stack, `${stack.stackName}CacheWarmupRule`, {
    schedule: Schedule.rate(Duration.minutes(1)),
  });

  rule.addTarget(
    new LambdaFunction(kickoffCacheLambda, {
      event: RuleTargetInput.fromObject({
        source: 'cdk.schedule',
        action: 'warmup',
      }),
    })
  );

  return { kickoffCacheLambda };
};

export { createKickoffCacheLambda };
