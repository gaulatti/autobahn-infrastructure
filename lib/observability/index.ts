import { Stack } from 'aws-cdk-lib';
import { createBuckets } from './storage';
import { createProcessingLambda } from './functions/processing';
import { createDashboard } from './dashboard';
import { createDistribution } from './network';
import { createSecrets } from './secrets';
import { createBuildProject } from './build';

const createObservabilityInfrastructure = (stack: Stack) => {
  /**
   * Secrets
   */
  const { certificateArnSecret, githubTokenSecret, frontendFqdnSecret } = createSecrets(stack);

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

  /**
   * Return the bucket for the ECS Task to upload the files
   */
  return { observabilityBucket };
};

export { createObservabilityInfrastructure };
