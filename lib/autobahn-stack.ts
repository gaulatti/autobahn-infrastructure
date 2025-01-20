import * as cdk from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { ArnPrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { createCluster } from './compute';
import { createTopics } from './events';
import { createCNAME, createDistribution, createHostedZone, createSecurityGroup, createVpc, createZoneCertificate } from './network';
import { createPermissions } from './permissions';
import { createCacheTable } from './persistence';
import { createBuckets } from './storage';
import { createWorkerInfrastructure } from './worker';

/**
 * The `AutobahnStack` class extends the AWS CDK `Stack` class and sets up the infrastructure for the Autobahn application.
 *
 * This stack includes the following resources:
 *
 * - VPC: A Virtual Private Cloud created using the `createVpc` function.
 * - ECS Cluster: An ECS cluster created using the `createCluster` function.
 * - Hosted Zone: A Route 53 hosted zone created using the `createHostedZone` function.
 * - Certificate: An ACM certificate created using the `createZoneCertificate` function.
 * - SNS Topics: Several SNS topics created using the `createTopics` function.
 * - DynamoDB Table: A DynamoDB table for caching created using the `createCacheTable` function.
 * - S3 Buckets: Multiple S3 buckets for observability, assets, and frontend created using the `createBuckets` function.
 * - Security Group: A security group created using the `createSecurityGroup` function.
 * - IAM User: An IAM user for GitHub Actions autobuild permissions created using the `createPermissions` function.
 * - ECR Repository: An ECR repository for the service.
 * - CloudWatch Log Group: A log group for service logs.
 * - CloudFront Distribution: A CloudFront distribution for the frontend created using the `createDistribution` function.
 * - Route 53 CNAME: A CNAME record for the distribution created using the `createCNAME` function.
 * - IAM Role: A service role assumed by an ARN principal.
 * - Worker Infrastructure: Additional infrastructure for workers created using the `createWorkerInfrastructure` function.
 *
 * @param scope - The scope in which this stack is defined.
 * @param id - The scoped construct ID.
 * @param props - Stack properties.
 */
export class AutobahnStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Initialize VPC
     */
    const { vpc } = createVpc(this);

    /**
     * Create Cluster
     */
    const { cluster } = createCluster(this, vpc);

    /**
     * Create Hosted Zone
     */
    const { hostedZone } = createHostedZone(this);

    /**
     * Create Certificate
     */
    const { certificate } = createZoneCertificate(this);

    /**
     * Create SNS Topics
     */
    const { triggerTopic, startPlaylistTopic, updatePlaylistTopic, pageSpeedInsightsTriggerTopic } = createTopics(this);

    /**
     * Create Cache Table
     */
    const { cacheTable } = createCacheTable(this);

    /**
     * Create Buckets
     */
    const { observabilityBucket, assetsBucket, frontendBucket } = createBuckets(this);

    /**
     * Create Security Group
     */
    const { securityGroup } = createSecurityGroup(this, vpc);

    /**
     * Creates the permissions for the GitHub Actions autobuild.
     */
    const { githubActionsUser } = createPermissions(this);

    /**
     * Storage (S3)
     */
    frontendBucket.grantReadWrite(githubActionsUser);

    /**
     * Creates an ECR repository for the service.
     */
    const repository = new Repository(this, `${this.stackName}EcrRepository`, {
      repositoryName: `${this.stackName.toLocaleLowerCase()}`,
    });
    repository.grantPullPush(githubActionsUser);

    /**
     * Log Group
     */
    new LogGroup(this, `${this.stackName}ServiceLogGroup`, {
      logGroupName: '/services/autobahn',
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    /**
     * Creates the distribution for the frontend.
     */
    const { distribution } = createDistribution(this, frontendBucket, certificate);
    distribution.grantCreateInvalidation(githubActionsUser);

    /**
     * Creates the CNAME for the distribution.
     */
    createCNAME(this, hostedZone, distribution);

    /**
     * Service Role
     */
    const serviceRole = new Role(this, `${this.stackName}ServiceRole`, {
      assumedBy: new ArnPrincipal(process.env.SERVICE_ROLE_ARN!),
      roleName: `${this.stackName}ServiceRole`,
    });

    /**
     * Create Worker Infrastructure
     */
    createWorkerInfrastructure(
      this,
      vpc,
      startPlaylistTopic,
      updatePlaylistTopic,
      pageSpeedInsightsTriggerTopic,
      cacheTable,
      observabilityBucket,
      serviceRole,
      cluster,
      securityGroup
    );
  }
}
