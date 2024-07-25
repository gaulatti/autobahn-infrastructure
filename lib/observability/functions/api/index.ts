import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { createKickoffLambda } from './kickoff';

const createApiLambdas = (stack: Stack, dataAccessLambda: NodejsFunction, kickoffCacheLambda: NodejsFunction) => {
  const { kickoffLambda } = createKickoffLambda(stack, dataAccessLambda, kickoffCacheLambda);

  return { kickoffLambda };
};

export { createApiLambdas };
