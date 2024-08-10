import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import { getCurrentUserBySub } from '../../../common/utils/api';
import { isWarmup } from '../../../common/utils';
import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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
    queryStringParameters,
  } = event;

  /**
   * Get the user from the Authorization header.
   */
  const { Authorization } = queryStringParameters!;

  /**
   * Get the user from the Authorization header.
   */
  const {
    payload: { sub },
  } = jwt.decode(Authorization!, { complete: true })!;
  const user = await getCurrentUserBySub(sub!.toString());

  /**
   * Get the teams the user is a member of.
   */
  const teams = user.me.memberships.map(({ teams_id }: { teams_id: number }) => teams_id);

  /**
   * Update the connections for each team (for broadcasting).
   */
  for (const team of teams) {
    const Key = {
      sub: team.toString(),
      type: 'teamConnections',
    };

    const params = {
      TableName: process.env.CACHE_TABLE_NAME,
      Key: marshall(Key),
    };

    const command = new GetItemCommand(params);
    const response = await client.send(command);
    const item = response.Item;

    if (!item) {
      /**
       * If the team does not exist in the database,
       * we need to create a new entry.
       */
      const params = {
        TableName: process.env.CACHE_TABLE_NAME,
        Item: marshall({
          connections: [connectionId],
          ...Key,
        }),
      };

      const putCommand = new PutItemCommand(params);
      await client.send(putCommand);
    } else {
      /**
       * If the team already exists in the database,
       * we only need to add the current connection.
       */
      const existingConnections = unmarshall(item).connections || [];
      existingConnections.push(connectionId);

      const updateParams = {
        TableName: process.env.CACHE_TABLE_NAME,
        Key: marshall(Key),
        UpdateExpression: 'SET connections = :connections',
        ExpressionAttributeValues: marshall({
          ':connections': existingConnections,
        }),
      };

      const updateCommand = new UpdateItemCommand(updateParams);
      await client.send(updateCommand);
    }
  }

  /**
   * Update the user's connections.
   */
  const params = {
    TableName: process.env.CACHE_TABLE_NAME,
    Item: marshall({
      sub: connectionId,
      type: 'connection',
      teams: teams,
    }),
  };

  const putCommand = new PutItemCommand(params);
  await client.send(putCommand);

  return {
    statusCode: 200,
    body: 'Connected',
  };
};

export { main };
