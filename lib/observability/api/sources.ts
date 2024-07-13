import { Stack } from 'aws-cdk-lib';
import { GraphqlApi, LambdaDataSource } from 'aws-cdk-lib/aws-appsync';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { capitalize } from '../../common/utils';

/**
 * Creates data sources for the GraphQL API.
 *
 * @param stack - The AWS CloudFormation stack.
 * @param api - The GraphQL API.
 * @param lambdas - The lambdas used as data sources.
 * @returns An object containing the created data sources.
 */
const createDataSources = (stack: Stack, api: GraphqlApi, lambdas: Record<string, IFunction>): Record<string, LambdaDataSource> => {
  const dataSources: Record<string, LambdaDataSource> = {};

  /**
   * Create a data source for each lambda.
   */
  Object.entries(lambdas).forEach(([key, lambda]) => {
    const dataSource = api.addLambdaDataSource(`${stack.stackName}${capitalize(key)}DataSource`, lambda);
    const dataSourceKey = key.replace('Lambda', 'DataSource');
    dataSources[dataSourceKey] = dataSource;
  });

  return dataSources;
};

export { createDataSources };
