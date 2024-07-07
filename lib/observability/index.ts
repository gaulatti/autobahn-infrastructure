import { Stack } from 'aws-cdk-lib';
import { createBuckets } from './storage';
import { createProcessingLambda } from './functions/processing';
import { createDashboard } from './dashboard';

const createObservabilityInfrastructure = (stack: Stack) => {
  /**
   * Storage (S3)
   */
  const { observabilityBucket, frontendBucket } = createBuckets(stack);

  /**
   * Process Lambda
   */
  const { processingLambda } = createProcessingLambda(stack, observabilityBucket);

  /**
   * Dashboard
   */
  const { dashboard } = createDashboard(stack);

  return { observabilityBucket };
};

export { createObservabilityInfrastructure };
