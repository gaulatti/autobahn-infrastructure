import { Stack } from 'aws-cdk-lib';
import { CognitoUserPoolsAuthorizer, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { camelToKebab } from '../../common/utils';

/**
 * Creates a gateway for the API.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param userPool - The Cognito user pool.
 * @param lambdas - The lambdas used in the API.
 * @returns An object containing the created API gateway.
 */
const createApi = (stack: Stack, userPool: UserPool, lambdas: Record<string, IFunction>) => {
  const authorizer = new CognitoUserPoolsAuthorizer(stack, `${stack.stackName}Authorizer`, {
    cognitoUserPools: [userPool],
  });

  const apiGateway = new RestApi(stack, `${stack.stackName}RestApi`, {
    restApiName: camelToKebab(stack.stackName),
    defaultMethodOptions: {
      authorizer,
    },
  });

  const root = apiGateway.root;
  root.addMethod('GET', new LambdaIntegration(lambdas.kickoffLambda));

  const executions = root.addResource('executions')
  executions.addMethod('GET', new LambdaIntegration(lambdas.executionsLambda));
  executions.addMethod('POST', new LambdaIntegration(lambdas.triggerExecutionLambda));

  const executionById = executions.addResource('{uuid}');
  executionById.addMethod('GET', new LambdaIntegration(lambdas.executionResultLambda));

  const executionResults = executionById.addResource('details');
  executionResults.addMethod('GET', new LambdaIntegration(lambdas.executionDetailsLambda));


  return { apiGateway };
};

export { createApi };
