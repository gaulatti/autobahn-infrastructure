import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createCommonInfrastructure } from './common';
import { createObservabilityInfrastructure } from './observability';
import { createServerInfrastructure } from './server';
import { createWorkerInfrastructure } from './worker';

/**
 * Represents the DressYouUpStack class.
 * This class extends the Stack class and is responsible for creating the DressYouUp stack.
 */
class DressYouUpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Create Observability Infrastructure
     */
    const { observabilityBucket } = createObservabilityInfrastructure(this);

    /**
     * Create the common infrastructure. This is shared between server and worker.
     */
    const { vpc, securityGroup, cluster, eip } = createCommonInfrastructure(this);

    /**
     * Create the server infrastructure
     */
    const { serverDnsName } = createServerInfrastructure(this, vpc, securityGroup, cluster);

    /**
     * Create the worker infrastructure
     */
    createWorkerInfrastructure(this, securityGroup, cluster, serverDnsName, observabilityBucket);
  }
}

export { DressYouUpStack };
