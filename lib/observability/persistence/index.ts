import { Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';

/**
 * Creates a cache table in the specified stack.
 *
 * @param stack - The stack in which to create the table.
 * @returns An object containing the created cache table.
 */
const createCacheTable = (stack: Stack) => {
  const cacheTable = new Table(stack, `${stack.stackName}CacheTable`, {
    tableName: `${stack.stackName}Cache`,
    partitionKey: { name: 'sub', type: AttributeType.STRING },
    sortKey: { name: 'type', type: AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
    timeToLiveAttribute: 'ttl',
  });

  return { cacheTable };
};

export { createCacheTable };
