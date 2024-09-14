import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { CronJob } from 'cron';
import { DalClient } from '../../dal/client';
import { randomUUID } from 'crypto';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
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

/**
 * Calculates the next execution time based on the given cron expression and current execution time.
 * If the cron expression is invalid or no next execution time is found, the current execution time is returned.
 *
 * @param cronExpression - The cron expression to calculate the next execution time.
 * @param currentExecutionTime - The current execution time.
 * @returns The next execution time or the current execution time if no next execution time is found.
 */
const getNextExecution = (cronExpression: string, currentExecutionTime: Date): Date => {
  let nextExecution: Date | undefined;

  const job = new CronJob(cronExpression, () => {}, undefined, false);
  const nextDate = job.nextDates(1).shift();

  if (nextDate) {
    nextExecution = nextDate.toJSDate();
  }

  return nextExecution || currentExecutionTime;
};

/**
 * The main function that processes the event.
 */
const main = async () => {
  /**
   * Create a new API Gateway Management API client.
   */
  if (!apiGatewayManagementApiClient) {
    apiGatewayManagementApiClient = new ApiGatewayManagementApiClient({
      endpoint: `https://${process.env.WEBSOCKET_API_FQDN}/prod`,
    });
  }

  /**
   * Get all the events for the current minute.
   */
  const currentTime = new Date();
  currentTime.setSeconds(0, 0);

  const schedules = await DalClient.getCurrentSchedules(currentTime.toISOString());
  for (const i in schedules) {
    const {
      id,
      cron,
      targets_id,
      target: {
        url,
        project: { teams_id },
      },
    } = schedules[i];

    try {
      /**
       * Create a new Pulse record.
       */
      const uuid = randomUUID();
      const { id: pulseId } = await DalClient.createPulse(teams_id, 3, uuid, url.id, 1, { targets_id });
      console.log(`Created pulse ${pulseId} with UUID ${uuid}`);

      /**
       * Create new heartbeat records.
       */
      const mobile = await DalClient.createHeartbeat(0, pulseId);
      const desktop = await DalClient.createHeartbeat(1, pulseId);

      /**
       * Trigger the new heartbeat records.
       */
      const mobileCommand = new PublishCommand({
        Message: JSON.stringify({ url: url.url, uuid, mode: 'mobile' }),
        TopicArn: process.env.TRIGGER_TOPIC_ARN,
      });
      const desktopCommand = new PublishCommand({
        Message: JSON.stringify({ url: url.url, uuid, mode: 'desktop' }),
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
    } catch (error) {
      console.error(`Failed to process schedule ${id}`, error);
    }

    const nextExecution = getNextExecution(cron, currentTime);
    await DalClient.updateSchedule(id, nextExecution);
  }
};

export { main };