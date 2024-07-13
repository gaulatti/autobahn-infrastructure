import { Stack } from 'aws-cdk-lib';
import { Code, FunctionRuntime, LambdaDataSource } from 'aws-cdk-lib/aws-appsync';

/**
 * Creates resolver code for a given field name.
 *
 * @param fieldName - The name of the field.
 * @returns The resolver code as a string.
 */
const createResolverCode = (fieldName: string) => `
  export function request(ctx) {
    const { source, args } = ctx;

    return {
      operation: 'Invoke',
      payload: {
        field: ctx.info.fieldName,
        sub: ctx.identity.claims.sub,
        arguments: args,
        source
      },
    };
  }

  export function response(ctx) {
    return ctx.result.${fieldName};
  }
`

/**
 * Creates resolvers for the given stack and data sources.
 * @param stack - The stack object.
 * @param dataSources - The data sources object.
 */
const createResolvers = (stack: Stack, dataSources: Record<string, LambdaDataSource>) => {
  dataSources.kickoffDataSource.createResolver(`${stack.stackName}KickoffResolver`, {
    typeName: 'Query',
    fieldName: 'kickoff',
    runtime: FunctionRuntime.JS_1_0_0,
    code: Code.fromInline(createResolverCode('kickoff')),
  });
};

export { createResolvers };
