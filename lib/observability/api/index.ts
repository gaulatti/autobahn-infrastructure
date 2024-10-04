import { Stack } from 'aws-cdk-lib';
import { AuthorizationType, CfnAccount, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { camelToKebab } from '../../common/utils';

const createWebsocketApi = (stack: Stack, lambdas: Record<string, NodejsFunction>) => {
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
      authorizationType: AuthorizationType.COGNITO,
      authorizer,
    },
  });

  const root = restApi.root;
  root.addMethod('GET', new LambdaIntegration(lambdas.kickoffLambda));

  const executions = root.addResource('executions');
  executions.addMethod('GET', new LambdaIntegration(lambdas.executionsLambda));
  executions.addMethod('POST', new LambdaIntegration(lambdas.triggerExecutionLambda));

  /**
   * Add the execution endpoint.
   */
  const executionById = executions.addResource('{uuid}');
  executionById.addMethod('GET', new LambdaIntegration(lambdas.executionResultLambda));

  /**
   * Add the results endpoint.
   */
  const executionMobileResults = executionById.addResource('mobile');
  const executionDesktopResults = executionById.addResource('desktop');
  executionMobileResults.addMethod('GET', new LambdaIntegration(lambdas.executionDetailsLambda));
  executionDesktopResults.addMethod('GET', new LambdaIntegration(lambdas.executionDetailsLambda));

  /**
   * Add the retry endpoint.
   */
  const executionMobileRetry = executionMobileResults.addResource('retry');
  const executionDesktopRetry = executionDesktopResults.addResource('retry');
  executionMobileRetry.addMethod('POST', new LambdaIntegration(lambdas.retryExecutionLambda));
  executionDesktopRetry.addMethod('POST', new LambdaIntegration(lambdas.retryExecutionLambda));

  /**
   * Add the JSON endpoint.
   */
  const executionMobileJSON = executionMobileResults.addResource('json');
  const executionDesktopJSON = executionDesktopResults.addResource('json');
  executionMobileJSON.addMethod('GET', new LambdaIntegration(lambdas.executionJSONLambda));
  executionDesktopJSON.addMethod('GET', new LambdaIntegration(lambdas.executionJSONLambda));

  /**
   * Projects
   */
  const projectsResource = root.addResource('projects');
  projectsResource.addMethod('GET', new LambdaIntegration(lambdas.projectsLambda));
  projectsResource.addMethod('POST', new LambdaIntegration(lambdas.createProjectLambda));

  const projectResource = projectsResource.addResource('{uuid}');
  projectResource.addMethod('GET', new LambdaIntegration(lambdas.projectDetailsLambda));
  projectResource.addMethod('POST', new LambdaIntegration(lambdas.updateProjectLambda));
  projectResource.addMethod('DELETE', new LambdaIntegration(lambdas.deleteProjectLambda));

  const projectStatsResource = projectResource.addResource('stats');
  projectStatsResource.addMethod('GET', new LambdaIntegration(lambdas.projectStatsLambda));

  /**
   * Schedules
   */
  const schedulesResource = projectResource.addResource('schedules');
  schedulesResource.addMethod('GET', new LambdaIntegration(lambdas.schedulesLambda));
  schedulesResource.addMethod('POST', new LambdaIntegration(lambdas.createScheduleLambda));

  const scheduleResource = schedulesResource.addResource('{scheduleUuid}');
  scheduleResource.addMethod('GET', new LambdaIntegration(lambdas.scheduleDetailsLambda));
  scheduleResource.addMethod('POST', new LambdaIntegration(lambdas.updateScheduleLambda));
  scheduleResource.addMethod('DELETE', new LambdaIntegration(lambdas.deleteScheduleLambda));

  /**
   * URLs
   */
  const urlsResource = root.addResource('urls');
  urlsResource.addMethod('GET', new LambdaIntegration(lambdas.urlsLambda));

  const urlResource = urlsResource.addResource('{uuid}');
  const urlStatsResource = urlResource.addResource('stats');
  urlStatsResource.addMethod('GET', new LambdaIntegration(lambdas.urlStatsLambda));
  const urlExecutionsResource = urlResource.addResource('executions');
  urlExecutionsResource.addMethod('GET', new LambdaIntegration(lambdas.urlExecutionsLambda));

  /**
   * Targets
   */
  const targetsResource = root.addResource('targets');
  targetsResource.addMethod('GET', new LambdaIntegration(lambdas.targetsLambda));
  targetsResource.addMethod('POST', new LambdaIntegration(lambdas.createTargetLambda));

  const targetResource = targetsResource.addResource('{uuid}');
  targetResource.addMethod('GET', new LambdaIntegration(lambdas.targetDetailsLambda));
  targetResource.addMethod('POST', new LambdaIntegration(lambdas.updateTargetLambda));
  targetResource.addMethod('DELETE', new LambdaIntegration(lambdas.deleteTargetLambda));

  const targetUrlsResource = targetResource.addResource('urls');
  targetUrlsResource.addMethod('GET', new LambdaIntegration(lambdas.targetUrlsLambda));

  const targetPulsesResource = targetResource.addResource('pulses');
  targetPulsesResource.addMethod('GET', new LambdaIntegration(lambdas.targetPulsesLambda));

  const targetStatsResource = targetResource.addResource('stats');
  targetStatsResource.addMethod('GET', new LambdaIntegration(lambdas.targetStatsLambda));

  const targetBaselinesResource = targetResource.addResource('baselines');
  targetBaselinesResource.addMethod('POST', new LambdaIntegration(lambdas.setBaselinesLambda));

  return { restApi };
};

export { createRestApi, createWebsocketApi };
