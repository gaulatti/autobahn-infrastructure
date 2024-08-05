import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DalClient } from '../dal/client';
import { isWarmup } from '../../../common/utils';
const client = new DynamoDBClient();

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: { sub: string }) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return;
  }

  const { sub } = event;

  const params = {
    TableName: process.env.KICKOFF_TABLE_NAME,
    Key: {
      sub: { S: sub },
    },
  };

  const command = new GetItemCommand(params);
  const response = await client.send(command);
  const item = response.Item;

  if (!item) {
    const me = await DalClient.getUserBySubWithMembershipAndTeam(sub!.toString());

    const putParams = {
      TableName: process.env.KICKOFF_TABLE_NAME,
      Item: marshall(me),
    };

    await client.send(new PutItemCommand(putParams));
    return me;
  }

  return unmarshall(item);
};

export { main };
