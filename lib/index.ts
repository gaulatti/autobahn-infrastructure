import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createServerInfrastructure } from './server';
import { createWorkerInfrastructure } from './worker';

class DressYouUpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const { dnsName } = createServerInfrastructure(this);

    createWorkerInfrastructure(this, dnsName);
  }
}

export { DressYouUpStack };
