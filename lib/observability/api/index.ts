import { Stack } from 'aws-cdk-lib';
import { CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { camelToKebab } from '../../common/utils';
import { WebSocketApi, WebSocketAuthorizer, WebSocketAuthorizerType, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

const createWebsocketApi = (stack: Stack, connectLambda: NodejsFunction, disconnectLambda: NodejsFunction, authorizerLambda: NodejsFunction, logProcessorLambda: NodejsFunction) => {
  const webSocketApi = new WebSocketApi(stack, `${stack.stackName}WebSocketApi`, {});

  /**
   * Create the WebSocket stage.
   */
  const webSocketStage = new WebSocketStage(stack, `${stack.stackName}WebSocketStage`, {
    webSocketApi,
    stageName: 'prod',
    autoDeploy: true,
  });

  const connectIntegration = new WebSocketLambdaIntegration(`${stack.stackName}ConnectIntegration`, connectLambda);
  const disconnectIntegration = new WebSocketLambdaIntegration(`${stack.stackName}DisconnectIntegration`, disconnectLambda);
  const logProcessorIntegration = new WebSocketLambdaIntegration(`${stack.stackName}LogProcessorIntegration`, logProcessorLambda);

  webSocketApi.addRoute('$connect', { integration: connectIntegration });
  webSocketApi.addRoute('$disconnect', { integration: disconnectIntegration });
  webSocketApi.addRoute('$default', { integration: logProcessorIntegration });

  webSocketApi.grantManageConnections(logProcessorLambda);

  return { webSocketApi };
};

/**
 * Creates a gateway for the API.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param userPool - The Cognito user pool.
 * @param lambdas - The lambdas used in the API.
 * @returns An object containing the created API gateway.
 */
const createRestApi = (stack: Stack, userPool: UserPool, lambdas: Record<string, IFunction>) => {
  const authorizer = new CognitoUserPoolsAuthorizer(stack, `${stack.stackName}Authorizer`, {
    cognitoUserPools: [userPool],
  });

  const restApi = new RestApi(stack, `${stack.stackName}RestApi`, {
    restApiName: camelToKebab(stack.stackName),
    defaultCorsPreflightOptions: {
      /**
       * Allow all origins for the API for preflight.
       * Origin filtering is done in the Lambda function.
       */
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: Cors.DEFAULT_HEADERS,
    },
    defaultMethodOptions: {
      authorizer,
    },
  });

  const root = restApi.root;
  root.addMethod('GET', new LambdaIntegration(lambdas.kickoffLambda));

  const executions = root.addResource('executions');
  executions.addMethod('GET', new LambdaIntegration(lambdas.executionsLambda));
  executions.addMethod('POST', new LambdaIntegration(lambdas.triggerExecutionLambda));

  const executionById = executions.addResource('{uuid}');
  executionById.addMethod('GET', new LambdaIntegration(lambdas.executionResultLambda));

  const executionMobileResults = executionById.addResource('mobile');
  const executionDesktopResults = executionById.addResource('desktop');
  executionMobileResults.addMethod('GET', new LambdaIntegration(lambdas.executionDetailsLambda));
  executionDesktopResults.addMethod('GET', new LambdaIntegration(lambdas.executionDetailsLambda));

  return { restApi };
};

export { createRestApi, createWebsocketApi };
