import { marshall } from '@aws-sdk/util-dynamodb';
import { ENUMS } from '../../../common/utils/consts';
import { DalClient } from '../dal/client';
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
const client = new DynamoDBClient();

/**
 * The main function for the kickoff event.
 *
 * @param event - The event object containing the field, sub, and arguments.
 * @returns An object with the kickoff information.
 */
const main = async (event: { sub: string }) => {
  const { sub } = event;

  const params = {
    TableName: process.env.KICKOFF_TABLE_ARN,
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
      TableName: process.env.KICKOFF_TABLE_ARN,
      Item: marshall(me),
    };

    await client.send(new PutItemCommand(putParams));
    return me;
  }

  return item;
};

export { main };
