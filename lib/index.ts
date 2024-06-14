import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createServerInfrastructure } from './server';
import { createWorkerInfrastructure } from './worker';
import { createTargetInfrastructure } from './target';
import { createCommonInfrastructure } from './common';

class DressYouUpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { vpc, securityGroup } = createCommonInfrastructure(this);

    const { serverDnsName } = createServerInfrastructure(this, vpc, securityGroup);
    const { targetDnsName } = createTargetInfrastructure(this);

    createWorkerInfrastructure(this, vpc, securityGroup, serverDnsName, targetDnsName);
  }
}

export { DressYouUpStack };
