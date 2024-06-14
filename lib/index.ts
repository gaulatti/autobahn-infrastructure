import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createServerInfrastructure } from './server';
import { createWorkerInfrastructure } from './worker';
import { createTargetInfrastructure } from './target';
import { createCommonInfrastructure } from './common';
import cluster from 'cluster';

class DressYouUpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * Create the target infrastructure. This is separate from server and worker.
     */
    const { targetDnsName } = createTargetInfrastructure(this);

    /**
     * Create the common infrastructure. This is shared between server and worker.
     */
    const { vpc, securityGroup, cluster } = createCommonInfrastructure(this);

    /**
     * Create the server infrastructure
     */
    const { serverDnsName } = createServerInfrastructure(this, vpc, securityGroup, cluster);

    /**
     * Create the worker infrastructure
     */
    createWorkerInfrastructure(this, vpc, securityGroup, cluster, serverDnsName, targetDnsName);
  }
}

export { DressYouUpStack };
