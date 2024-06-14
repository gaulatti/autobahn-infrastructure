import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createServerInfrastructure } from './server';
import { createWorkerInfrastructure } from './worker';

class DressYouUpStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    createServerInfrastructure(this);

    createWorkerInfrastructure(this);
  }
}

export { DressYouUpStack };
