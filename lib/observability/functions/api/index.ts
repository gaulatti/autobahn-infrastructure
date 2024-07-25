import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { createKickoffLambda } from './kickoff';

const createApiLambdas = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  const { kickoffLambda } = createKickoffLambda(stack, dataAccessLambda);

  return { kickoffLambda };
};

export { createApiLambdas };
