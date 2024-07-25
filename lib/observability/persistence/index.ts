import { Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

/**
 * Creates a kickoff table in the specified stack.
 *
 * @param stack - The stack in which to create the table.
 * @returns An object containing the created kickoff table.
 */
const createKickoffTable = (stack: Stack) => {
  const kickoffTable = new Table(stack, `${stack.stackName}KickoffTable`, {
    tableName: `${stack.stackName}KickoffTable`,
    partitionKey: { name: 'sub', type: AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
  });

  return { kickoffTable };
};

export { createKickoffTable };
