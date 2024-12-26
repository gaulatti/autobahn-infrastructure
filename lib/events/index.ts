import { Stack } from 'aws-cdk-lib';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { LoggingProtocol, Topic } from 'aws-cdk-lib/aws-sns';

/**
 * Creates topics for the worker.
 *
 * @param stack - The stack object.
 * @returns An object containing the created topics.
 */
const createTopics = (stack: Stack) => {
  /**
   * Creates a role for logging.
   */
  const loggingRole = new Role(stack, `${stack.stackName}SnsLoggingRole`, {
    assumedBy: new ServicePrincipal('sns.amazonaws.com'),
  });

  loggingRole.addToPolicy(
    new PolicyStatement({
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents', 'logs:PutMetricFilter', 'logs:PutRetentionPolicy'],
      resources: ['*'],
    })
  );

  /**
   * Creates a trigger topic for the worker.
   */
  const triggerTopic = new Topic(stack, `${stack.stackName}WorkerTriggerTopic`, {
    topicName: `${stack.stackName}WorkerTrigger`,
    displayName: 'Lighthouse On-Demand Trigger',
  });

  /**
   * Creates a start playlist topic for the worker.
   */
  const startPlaylistTopic = new Topic(stack, `${stack.stackName}StartPlaylistTopic`, {
    topicName: `${stack.stackName}StartPlaylist`,
    displayName: 'It Triggers a Playlist',
    loggingConfigs: [
      {
        protocol: LoggingProtocol.HTTP,
        failureFeedbackRole: loggingRole,
        successFeedbackRole: loggingRole,
        successFeedbackSampleRate: 100,
      },
    ],
  });

  /**
   * Creates an update playlist topic for the worker.
   */
  const updatePlaylistTopic = new Topic(stack, `${stack.stackName}UpdatePlaylistTopic`, {
    topicName: `${stack.stackName}UpdatePlaylist`,
    displayName: 'It Updates a Playlist',
    loggingConfigs: [
      {
        protocol: LoggingProtocol.HTTP,
        failureFeedbackRole: loggingRole,
        successFeedbackRole: loggingRole,
        successFeedbackSampleRate: 100,
      },
    ],
  });

  return { startPlaylistTopic, triggerTopic, updatePlaylistTopic };
};

export { createTopics };
