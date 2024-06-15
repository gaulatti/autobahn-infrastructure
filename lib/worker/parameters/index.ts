import { Stack } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

/**
 * Creates parameters for the specified stack.
 * @param stack - The stack for which to create parameters.
 * @returns An object containing the created parameters.
 */
const createParameters = (stack: Stack) => {
  const apiKeyParameter = new StringParameter(stack, `${stack.stackName}ApiKey`, {
    parameterName: `${stack.stackName}ApiKey`,
    stringValue: 'e9963d14-ca0d-4eee-aaf2-3f08159f5c5e',
  });

  return { apiKeyParameter };
};

export { createParameters };
