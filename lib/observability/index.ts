import { Stack } from 'aws-cdk-lib';
import { createBucket } from './storage';
import { createProcessingLambda } from './functions/processing';

const createObservabilityInfrastructure = (stack: Stack) => {
  /**
   * Storage (S3)
   */
  const { observabilityBucket } = createBucket(stack);

  /**
   * Process Lambda
   */
  const { processingLambda } = createProcessingLambda(stack, observabilityBucket);

  return { observabilityBucket };
};

export { createObservabilityInfrastructure };
