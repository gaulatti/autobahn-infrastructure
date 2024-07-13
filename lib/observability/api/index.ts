import { Stack } from 'aws-cdk-lib';
import { AuthorizationType, FieldLogLevel, GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { camelToKebab } from '../../common/utils';
import { createResolvers } from './resolvers';
import { createDataSources } from './sources';

/**
 * Builds a GraphQL API using the provided stack and user pool.
 * @param stack - The AWS CloudFormation stack.
 * @param userPool - The AWS Cognito user pool.
 * @returns The constructed GraphQL API.
 */
const createApi = (stack: Stack, userPool: UserPool, lambdas: Record<string, IFunction>) => {
  /**
   * GraphQL API
   */
  const api = new GraphqlApi(stack, `${stack.stackName}Api`, {
    name: camelToKebab(stack.stackName),
    schema: SchemaFile.fromAsset('./lib/observability/api/api.graphql'),
    logConfig: {
      fieldLogLevel: FieldLogLevel.ALL,
    },
    authorizationConfig: {
      defaultAuthorization: {
        authorizationType: AuthorizationType.USER_POOL,
        userPoolConfig: {
          userPool,
        },
      },
    },
    xrayEnabled: true,
  });

  /**
   * Creates data sources for the GraphQL API.
   */
  const dataSources = createDataSources(stack, api, lambdas);

  /**
   * Creates resolvers for the GraphQL API.
   */
  createResolvers(stack, dataSources);
  return { api };
};

export { createApi };
