import { Statistic } from 'aws-cdk-lib/aws-cloudwatch';
import { Project } from 'aws-cdk-lib/aws-codebuild';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { AllowedRequest, GetTeamRequest, GetUserRequest, RequestType } from './types';
import { Model, ModelStatic, Transaction } from 'sequelize';

/**
 * Executes the operation based on the request type.
 * @param models - The models object containing the Sequelize models.
 * @param request - The request object specifying the request type.
 * @param params - Additional parameters for the operation.
 * @returns A promise that resolves to the result of the operation.
 * @throws An error if the request type is invalid.
 */
const executeOperation = async (transaction: Transaction, models: Record<string, ModelStatic<Model>>, request: AllowedRequest) => {
  const { User, Team, Project, Membership, Target, Assignment, Beacon, Engagement, Schedule, Statistic } = models;
  /**
   * Perform the operation based on the request type.
   */
  switch (request.request_type) {
    /**
     * Users
     */
    case RequestType.GetUser:
      return User.findOne({ transaction, where: { id: (request as GetUserRequest).payload } });
    case RequestType.GetUserByEmail:
      return User.findOne({ transaction, where: { email: (request as GetUserRequest).payload } });
    case RequestType.GetUserBySubWithMembershipAndTeam:
      return User.findOne({
        transaction,
        where: { sub: (request as GetUserRequest).payload },
        include: [
          {
            model: Membership,
            as: 'memberships',
            include: [
              {
                model: Team,
                as: 'team',
              },
            ],
          },
        ],
      });
    case RequestType.GetUserBySub:
      return User.findOne({ transaction, where: { sub: (request as GetUserRequest).payload } });
    case RequestType.GetUserBySub:
      return User.findOne({ transaction, where: { sub: (request as GetUserRequest).payload } });
    case RequestType.CreateUser:
      return User.create({ transaction, ...request });

    /**
     * Teams
     */
    case RequestType.ListTeamsBySub:
      // TODO: Filter by current sub
      return Team.findAll({ transaction });
    case RequestType.GetTeam:
      return Team.findOne({ transaction, where: { id: (request as GetTeamRequest).payload } });

    /**
     * Features
     */
    case RequestType.ListFeaturesBySub:
      return Team.findAll({ transaction });

    /**
     * Projects
     */
    case RequestType.ListProjects:
      return Project.findAll({ transaction });
    case RequestType.ListProjectsByTeam:
      return Project.findAll({ transaction, where: { teams_id: request.payload } });
    case RequestType.GetProject:
      return Project.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateProject:
      return Project.create({ transaction, ...request });

    /**
     * Memberships
     */
    case RequestType.ListMemberships:
      return Membership.findAll({ transaction });
    case RequestType.ListMembershipsByUser:
      return Membership.findAll({ transaction, where: { users_id: request.payload } });
    case RequestType.ListMembershipsByUserWithTeam:
      return Membership.findAll({ transaction, where: { users_id: request.payload }, include: [Team] });
    case RequestType.ListMembershipsByTeam:
      return Membership.findAll({ transaction, where: { teams_id: request.payload } });
    case RequestType.GetMembership:
      return Membership.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateMembership:
      return Membership.create({ transaction, ...request });

    /**
     * Assignments
     */
    case RequestType.ListAssignments:
      return Assignment.findAll({ transaction });
    case RequestType.ListAssignmentsByProject:
      return Assignment.findAll({ transaction, where: { projects_id: request.payload } });
    case RequestType.ListAssignmentsByMembership:
      return Assignment.findAll({ transaction, where: { memberships_id: request.payload } });
    case RequestType.GetAssignment:
      return Assignment.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateAssignment:
      return Assignment.create({ transaction, ...request });

    /**
     * Targets
     */
    case RequestType.ListTargets:
      return Target.findAll({ transaction });
    case RequestType.ListTargetsByProject:
      return Target.findAll({ transaction, where: { projects_id: request.payload } });
    case RequestType.GetTarget:
      return Target.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateTarget:
      return Target.create({ transaction, ...request });

    /**
     * Beacons
     */
    case RequestType.ListBeacons:
      return Beacon.findAll({ transaction });
    case RequestType.ListBeaconsByTeam:
      return Beacon.findAll({ transaction, where: { teams_id: request.payload } });
    case RequestType.ListBeaconsByUser:
      return Beacon.findAll({ transaction, where: { triggered_by: request.payload } });
    case RequestType.GetBeacon:
      return Beacon.findOne({ transaction, where: { id: request.payload } });
    case RequestType.GetBeaconByUUID:
      return Beacon.findAll({ transaction, where: { uuid: request.payload } });
    case RequestType.CreateBeacon:
      return Beacon.create({ transaction, ...request });
    case RequestType.UpdateBeacon:
      return await (await Beacon.findOne({ transaction, where: { id: request.id } }))!.update({ transaction, ...request });

    /**
     * Engagements
     */
    case RequestType.ListEngagements:
      return Engagement.findAll({ transaction });
    case RequestType.ListEngagementsByTarget:
      return Engagement.findAll({ transaction, where: { targets_id: request.payload } });
    case RequestType.GetEngagement:
      return Engagement.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateEngagement:
      return Engagement.create({ transaction, ...request });

    /**
     * Schedules
     */
    case RequestType.ListSchedules:
      return Schedule.findAll({ transaction });
    case RequestType.ListSchedulesByTarget:
      return Schedule.findAll({ transaction, where: { targets_id: request.payload } });
    case RequestType.GetSchedule:
      return Schedule.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateSchedule:
      return Schedule.create({ transaction, ...request });

    /**
     * Statistics
     */
    case RequestType.ListStatistics:
      return Statistic.findAll({ transaction });
    case RequestType.ListStatisticsByTarget:
      return Statistic.findAll({ transaction, where: { targets_id: request.payload } });
    case RequestType.GetStatistic:
      return Statistic.findOne({ transaction, where: { id: request.payload } });
    case RequestType.CreateStatistic:
      return Statistic.create({ transaction, ...request });

    default:
      throw new Error(`Invalid request type: ${request.request_type}`);
  }
};

export { executeOperation };
