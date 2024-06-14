import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createServerInfrastructure } from './server';
import { createWorkerInfrastructure } from './worker';
import { createTargetInfrastructure } from './target';

class DressYouUpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { serverDnsName } = createServerInfrastructure(this);
    const { targetDnsName } = createTargetInfrastructure(this);

    createWorkerInfrastructure(this, serverDnsName, targetDnsName);
  }
}

export { DressYouUpStack };
