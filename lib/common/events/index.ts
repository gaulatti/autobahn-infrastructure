import { Stack } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';

/**
 * Creates topics for the worker.
 *
 * @param stack - The stack object.
 * @returns An object containing the created topics.
 */
const createTopics = (stack: Stack) => {
  const triggerTopic = new Topic(stack, `${stack.stackName}WorkerTriggerTopic`, {
    topicName: `${stack.stackName}WorkerTrigger`,
    displayName: 'Lighthouse On-Demand Trigger',
  });

  return { triggerTopic };
};

export { createTopics };
