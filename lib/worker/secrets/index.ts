import { Stack } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

/**
 * Creates parameters for the specified stack.
 * @param stack - The stack for which to create parameters.
 * @returns An object containing the created parameters.
 */
const createParameters = (stack: Stack) => {
  const urlParameter = new StringParameter(stack, `${stack.stackName}Url`, { parameterName: `${stack.stackName}Url`, stringValue: 'TBD' });

  const apiKeyParameter = new StringParameter(stack, `${stack.stackName}ApiKey`, {
    parameterName: `${stack.stackName}ApiKey`,
    stringValue: 'TBD',
  });

  const targetParameter = new StringParameter(stack, `${stack.stackName}Target`, {
    parameterName: `${stack.stackName}Target`,
    stringValue: 'TBD',
  });

  return { urlParameter, apiKeyParameter, targetParameter };
};

export { createParameters };
