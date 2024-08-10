import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { isWarmup } from '../../../common/utils';
import { DeleteItemCommand, DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

/**
 * The DynamoDB client.
 */
const client = new DynamoDBClient();

const main = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
    return { statusCode: 200, body: 'warmup' };
  }
  const {
    requestContext: { connectionId },
  } = event;

  console.log(`Tschuss ${connectionId}`, event);
  const userParams = {
    TableName: process.env.CACHE_TABLE_NAME,
    Key: marshall({
      sub: connectionId,
      type: 'connection',
    }),
  };

  /**
   * Get current connection from the DynamoDB table.
   */
  const command = new GetItemCommand(userParams);
  const response = await client.send(command);
  const item = unmarshall(response.Item!);

  /**
   * For every team, we remove its connection from the DynamoDB table.
   */
  for (const team of item.teams) {
    const teamParams = {
      TableName: process.env.CACHE_TABLE_NAME,
      Key: marshall({
        sub: team.toString(),
        type: 'teamConnections',
      }),
    };

    const getTeamCommand = new GetItemCommand(teamParams);
    const getTeamResponse = await client.send(getTeamCommand);
    const teamRecord = getTeamResponse.Item!;

    const existingConnections = (unmarshall(teamRecord).connections || []).filter((connection: string) => connection !== connectionId);
    const updateParams = {
      ...teamParams,
      UpdateExpression: 'SET connections = :connections',
      ExpressionAttributeValues: marshall({
        ':connections': existingConnections,
      }),
    };

    const updateCommand = new UpdateItemCommand(updateParams);
    await client.send(updateCommand);
  }

  /**
   * Remove current connection from the DynamoDB table.
   */
  await client.send(new DeleteItemCommand(userParams));

  return {
    statusCode: 200,
    body: 'Disconnected',
  };
};

export { main };
