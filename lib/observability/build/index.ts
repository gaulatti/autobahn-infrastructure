import { SecretValue, Stack } from 'aws-cdk-lib';
import { CloudFrontWebDistribution } from 'aws-cdk-lib/aws-cloudfront';
import {
  Artifacts,
  BuildEnvironmentVariableType,
  BuildSpec,
  EventAction,
  FilterGroup,
  GitHubSourceCredentials,
  LinuxBuildImage,
  Project,
  Source,
} from 'aws-cdk-lib/aws-codebuild';
import { UserPool, UserPoolClient, UserPoolDomain } from 'aws-cdk-lib/aws-cognito';
import { Bucket } from 'aws-cdk-lib/aws-s3';

/**
 * Creates a CodeBuild project to build React assets and deploy them to S3 and CloudFront.
 * @param stack - The AWS CloudFormation stack.
 * @param bucket - The S3 bucket to deploy the assets to.
 * @param distribution - The CloudFront distribution to invalidate after deployment.
 * @param sourceToken - The secret containing the GitHub access token.
 */
const createBuildProject = (
  stack: Stack,
  bucket: Bucket,
  distribution: CloudFrontWebDistribution,
  userPool: UserPool,
  userPoolDomain: UserPoolDomain,
  userPoolClient: UserPoolClient
) => {
  /**
   * Represents the build specification to build the React Assets.
   */
  const buildSpec = {
    version: '0.2',
    phases: {
      install: {
        'runtime-versions': {
          nodejs: '20',
        },
        commands: ['npm install'],
      },
      build: {
        commands: ['npm run build'],
      },
      post_build: {
        commands: [
          `aws s3 rm s3://${bucket.bucketName} --recursive`,
          `aws s3 sync dist/ s3://${bucket.bucketName}`,
          `aws cloudfront create-invalidation --distribution-id ${distribution.distributionId} --paths "/index.html"`,
        ],
      },
    },
  };

  /**
   * Represents the GitHub source credentials to access the repository.
   * Use this only if your account does not have another stack with GitHub creds (only one per account is allowed)
   *
   * For that purpose, set the env variable GITHUB_TOKEN with the GitHub access token.
   */
  if (process.env.GITHUB_TOKEN) {
    new GitHubSourceCredentials(stack, `${stack.stackName}GitHubCreds`, {
      accessToken: SecretValue.unsafePlainText(process.env.GITHUB_TOKEN),
    });
  }

  /**
   * Represents the CodeBuild project to build the React Assets.
   */
  const frontendBuildProject = new Project(stack, `${stack.stackName}BuildProject`, {
    projectName: `${stack.stackName}BuildProject`,
    source: Source.gitHub({
      owner: 'gaulatti',
      repo: 'whos-that-girl',
      webhook: true,
      webhookFilters: [FilterGroup.inEventOf(EventAction.PUSH).andBranchIs('main')],
      reportBuildStatus: true,
      cloneDepth: 1,
    }),
    environment: {
      buildImage: LinuxBuildImage.STANDARD_5_0,
      environmentVariables: {
        VITE_PROD_FQDN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: process.env.FRONTEND_FQDN,
        },
        VITE_USER_POOL_DOMAIN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: `${userPoolDomain.domainName}.auth.${stack.region}.amazoncognito.com`,
        },
        VITE_USER_POOL_CLIENT_ID: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: userPoolClient.userPoolClientId,
        },
        VITE_USER_POOL_ID: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: userPool.userPoolId,
        },
      },
    },
    artifacts: Artifacts.s3({
      bucket: bucket,
      includeBuildId: false,
      packageZip: false,
      path: 'dist',
    }),
    buildSpec: BuildSpec.fromObject(buildSpec),
  });

  /**
   * Grants the CodeBuild project permission to create invalidations on the CloudFront distribution.
   */
  distribution.grantCreateInvalidation(frontendBuildProject);

  return { frontendBuildProject };
};

export { createBuildProject };
