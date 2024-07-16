import { Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { createBeaconLambda } from './beacon';
import { createEngagementLambda } from './engagement';
import { createKickoffLambda } from './kickoff';
import { createProjectLambda } from './project';
import { createScheduleLambda } from './schedule';
import { createStatisticLambda } from './statistic';
import { createTargetLambda } from './target';
import { createTeamLambda } from './team';
import { createUserLambda } from './user';
import { createAssignmentLambda } from './assignment';
import { createMembershipLambda } from './membership';

const createApiLambdas = (stack: Stack, dataAccessLambda: NodejsFunction) => {
  const { assignmentLambda } = createAssignmentLambda(stack, dataAccessLambda);
  const { kickoffLambda } = createKickoffLambda(stack, dataAccessLambda);
  const { membershipLambda } = createMembershipLambda(stack, dataAccessLambda);
  const { userLambda } = createUserLambda(stack, dataAccessLambda);
  const { projectLambda } = createProjectLambda(stack, dataAccessLambda);
  const { beaconLambda } = createBeaconLambda(stack, dataAccessLambda);
  const { scheduleLambda } = createScheduleLambda(stack, dataAccessLambda);
  const { teamLambda } = createTeamLambda(stack, dataAccessLambda);
  const { targetLambda } = createTargetLambda(stack, dataAccessLambda);
  const { engagementLambda } = createEngagementLambda(stack, dataAccessLambda);
  const { statisticLambda } = createStatisticLambda(stack, dataAccessLambda);

  return { assignmentLambda, kickoffLambda, membershipLambda, userLambda, projectLambda, beaconLambda, scheduleLambda, teamLambda, targetLambda, engagementLambda, statisticLambda };
};

export { createApiLambdas };
