import { Stack } from 'aws-cdk-lib';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { camelToKebab } from '../../common/utils';
import { IWebSocketRouteAuthorizer, WebSocketApi, WebSocketAuthorizer, WebSocketAuthorizerType, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { CfnAccount, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { WebSocketLambdaAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

const createWebsocketApi = (
  stack: Stack,
  lambdas: Record<string, NodejsFunction>,
) => {
  const webSocketApi = new WebSocketApi(stack, `${stack.stackName}WebSocketApi`, {});

  /**
   * Create the log group for the API Gateway.
   */
  const apiGatewayLoggingRole = new Role(stack, `${stack.stackName}ApiGatewayLoggingRole`, {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
    managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')],
  });

  /**
   * Create the log group for the API Gateway.
   */
  new CfnAccount(stack, `${stack.stackName}ApiGatewayAccount`, {
    cloudWatchRoleArn: apiGatewayLoggingRole.roleArn,
  });

  /**
   * Create the WebSocket stage.
   */
  const webSocketStage = new WebSocketStage(stack, `${stack.stackName}WebSocketStage`, {
    webSocketApi,
    stageName: 'prod',
    autoDeploy: true,
  });

  /**
   * Create the WebSocket authorizer.
   */
  const webSocketAuthorizer = new WebSocketLambdaAuthorizer(`${stack.stackName}WebSocketAuthorizer`, lambdas.authorizerLambda, {
    authorizerName: `${stack.stackName}WebSocketAuthorizer`,
    identitySource: ['route.request.querystring.Authorization'],
  });

  /**
   * Create the WebSocket integrations.
   */
  const connectIntegration = new WebSocketLambdaIntegration(`${stack.stackName}ConnectIntegration`, lambdas.connectLambda);
  const disconnectIntegration = new WebSocketLambdaIntegration(`${stack.stackName}DisconnectIntegration`, lambdas.disconnectLambda);
  const logProcessorIntegration = new WebSocketLambdaIntegration(`${stack.stackName}LogProcessorIntegration`, lambdas.logProcessorLambda);

  /**
   * Add the routes to the WebSocket API.
   */
  webSocketApi.addRoute('$connect', { integration: connectIntegration, authorizer: webSocketAuthorizer });
  webSocketApi.addRoute('$disconnect', { integration: disconnectIntegration });
  webSocketApi.addRoute('$default', { integration: logProcessorIntegration });

  /**
   * Grant the necessary permissions to the lambdas.
   */
  webSocketApi.grantManageConnections(lambdas.connectLambda);
  webSocketApi.grantManageConnections(lambdas.disconnectLambda);
  webSocketApi.grantManageConnections(lambdas.logProcessorLambda);

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
