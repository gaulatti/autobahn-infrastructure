import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { randomUUID } from 'crypto';
import { getCurrentUser, HandleDelivery } from '../../../../common/utils/api';
import { DalClient } from '../../dal/client';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

/**
 * Prepends 'www.' to the hostname of the given URL if it does not already start with 'www.'.
 *
 * @param url - The URL to modify.
 * @returns The modified URL with 'www.' prepended to the hostname if necessary.
 */
const prependWWW = (url: string): string => {
  const urlObj = new URL(url);

  /**
   * Split the hostname into parts.
   */
  const parts = urlObj.hostname.split('.');

  /**
   * If the hostname has exactly two parts and does not start with 'www.', prepend 'www.' to the hostname.
   */
  if (parts.length === 2 && !urlObj.hostname.startsWith('www.')) {
    urlObj.hostname = 'www.' + urlObj.hostname;
  }

  return urlObj.toString();
};

/**
 * The SNS client.
 */
const snsClient = new SNSClient();

/**
 * The DynamoDB client.
 */
const client = new DynamoDBClient();

/**
 * The API Gateway Management API client.
 */
let apiGatewayManagementApiClient: ApiGatewayManagementApiClient;

const main = HandleDelivery(async (event: AWSLambda.APIGatewayEvent) => {
  const { url, team } = JSON.parse(event.body!);
  const { me } = await getCurrentUser(event);

  /**
   * Create a new API Gateway Management API client.
   */
  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: `https://${process.env.WEBSOCKET_API_FQDN}/prod`,
    });
  }

  /**
   * Generate a new UUID.
   */
  const membership = me.memberships.find((membership: { teams_id: number }) => membership.teams_id == team);

  /**
   * Get URL Record
   */
  const sanitizedUrl = prependWWW(url);
  let urlRecord = (await DalClient.getURL(sanitizedUrl)) || (await DalClient.createURL(url, randomUUID()));

  /**
   * Create a new Pulse record.
   */
  const uuid = randomUUID();
  const { id } = await DalClient.createPulse(team, 3, uuid, urlRecord.id, 1, { triggered_by: membership.id });
  console.log(`Created pulse ${id} with UUID ${uuid}`);

  /**
   * Create new heartbeat records.
   */
  const mobile = await DalClient.createHeartbeat(0, id);
  const desktop = await DalClient.createHeartbeat(1, id);

  /**
   * Trigger the new heartbeat records.
   */
  const mobileCommand = new PublishCommand({
    Message: JSON.stringify({ url: urlRecord.url, uuid, mode: 'mobile' }),
    TopicArn: process.env.TRIGGER_TOPIC_ARN,
  });
  const desktopCommand = new PublishCommand({
    Message: JSON.stringify({ url: urlRecord.url, uuid, mode: 'desktop' }),
    TopicArn: process.env.TRIGGER_TOPIC_ARN,
  });
  await snsClient.send(mobileCommand);
  await snsClient.send(desktopCommand);

  /**
   * Broadcast the new metrics to all connections.
   */
  const teamParams = {
    TableName: process.env.CACHE_TABLE_NAME,
    Key: marshall({
      sub: team.toString(),
      type: 'teamConnections',
    }),
  };

  const getTeamCommand = new GetItemCommand(teamParams);
  const getTeamResponse = await client.send(getTeamCommand);
  const teamRecord = unmarshall(getTeamResponse.Item!);

  const connections = teamRecord.connections || [];
  for (const connection of connections) {
    try {
      const params = {
        ConnectionId: connection,
        Data: Buffer.from(JSON.stringify({ action: 'REFRESH_EXECUTIONS_TABLE' })),
      };
      await apiGatewayManagementApiClient.send(new PostToConnectionCommand(params));
      console.log(`Sent message to connection ${connection}`);
    } catch (error) {
      console.error(`Failed to send message to connection ${connection}`, error);
    }
  }

  /**
   * Return the response.
   */
  return { mobile, desktop, url: urlRecord.uuid };
});

export { main };
