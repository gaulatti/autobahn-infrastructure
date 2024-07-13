import { Stack } from 'aws-cdk-lib';
import { AuthorizationType, FieldLogLevel, GraphqlApi, SchemaFile } from 'aws-cdk-lib/aws-appsync';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { camelToKebab } from '../../common/utils';

/**
 * Builds a GraphQL API using the provided stack and user pool.
 * @param stack - The AWS CloudFormation stack.
 * @param userPool - The AWS Cognito user pool.
 * @returns The constructed GraphQL API.
 */
const createApi = (stack: Stack, userPool: UserPool) => {
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

  return { api };
};

export { createApi };
