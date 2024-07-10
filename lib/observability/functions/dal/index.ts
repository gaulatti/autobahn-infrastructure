import { Duration, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Creates a processing Lambda function for querying the Database.
 * @param stack - The AWS CloudFormation stack.
 * @returns An object containing the processing Lambda function.
 */
const createDataAccessLambda = (stack: Stack) => {
  const dataAccessLambda = new NodejsFunction(stack, `${stack.stackName}DataAccessLambda`, {
    functionName: `${stack.stackName}DataAccess`,
    entry: './lib/observability/functions/dal/index.src.ts',
    handler: 'main',
    runtime: Runtime.NODEJS_20_X,
    timeout: Duration.minutes(1),
    memorySize: 1024,
    environment: {
      DATABASE_SECRET: process.env.DATABASE_SECRET_ARN!,
      DATABASE_FQDN: process.env.DATABASE_FQDN!,
      DATABASE_NAME: process.env.DATABASE_NAME!,
    },
    bundling: {
      /**
       * Sequelize for some reason has an unneeded dependency on pg-hstore.
       * Given we're using MySQL, we can safely exclude this module.
       */
      externalModules: ['pg-hstore'],

      /**
       * Sequelize requires the mysql2 and sequelize modules to be present.
       */
      nodeModules: ['mysql2', 'sequelize']
    }
  });

  /**
   * Add permissions to the Lambda function to access the Database secret.
   */
  dataAccessLambda.addToRolePolicy(new PolicyStatement({
    actions: ['secretsmanager:GetSecretValue'],
    resources: [process.env.DATABASE_SECRET_ARN!],
  }));

  return { dataAccessLambda };
};

export { createDataAccessLambda };
