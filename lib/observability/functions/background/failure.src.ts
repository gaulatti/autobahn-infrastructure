import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { isWarmup } from '../../../common/utils';
import { DalClient } from '../dal/client';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

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

const getViewportIndex = (viewport: string) => {
  switch (viewport) {
    case 'mobile':
      return 0;
    case 'desktop':
      return 1;
    default:
      throw new Error('Invalid viewport');
  }
};

const main = async (event: { status: string; uuid: string; mode: string }) => {
  if (isWarmup(event)) {
    /**
     * This is a warmup event, so we don't need to do anything.
     */
  }

  const { uuid, mode } = event;

  /**
   * Create a new API Gateway Management API client.
   */
  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: `https://${process.env.WEBSOCKET_API_FQDN}/prod`,
    });
  }

  /**
   * Retrieve the viewport ID from the path parameters.
   */
  const viewportIndex = getViewportIndex(mode!);

  /**
   * Retrieve the heartbeat details from the database.
   */
  const pulse = await DalClient.getPulseByUUID(uuid!);
  const { url, teams_id } = pulse;
  const { id, retries } = pulse.heartbeats.find(({ mode }: { mode: number }) => mode === viewportIndex);

  if (retries > 2) {
    /**
     * Update the retries count
     */
    await DalClient.updateFailedHeartbeat(id, retries + 1);
  } else {
    await DalClient.updateHeartbeatRetries(id, retries + 1);

    /**
     * Re-trigger the execution.
     */
    const command = new PublishCommand({
      Message: JSON.stringify({ url, uuid, mode: mode }),
      TopicArn: process.env.TRIGGER_TOPIC_ARN,
    });

    const execution = await snsClient.send(command);
  }

  /**
   * Broadcast the new metrics to all connections.
   */
  const teamParams = {
    TableName: process.env.CACHE_TABLE_NAME,
    Key: marshall({
      sub: teams_id.toString(),
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

  return;
};

export { main };
