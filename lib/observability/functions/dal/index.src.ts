import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { Sequelize } from 'sequelize';
import { defineModels } from './entity';
import { AllowedRequest, GetTeamRequest, GetUserRequest, RequestType } from './types';

/**
 * This function retrieves the secret value from the Database secret.
 */
const client = new SecretsManagerClient({});
let databaseCredentials: Record<string, string>;
let sequelize: Sequelize;

/**
 * The main function that handles the request and performs the database operations.
 *
 * @param request - The request object containing the type and necessary parameters.
 * @returns A promise that resolves to the result of the database operation.
 * @throws An error if the request type is invalid or if there is an error retrieving the secret.
 */
const main = async (request: AllowedRequest) => {
  try {
    /**
     * Retrieve the secret value from the Database secret.
     */
    if (!databaseCredentials) {
      const command = new GetSecretValueCommand({ SecretId: process.env.DATABASE_SECRET });
      const response = await client.send(command);
      databaseCredentials = JSON.parse(response.SecretString!);
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }

  /**
   * Create a new Sequelize instance if one does not exist.
   */
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_NAME!, databaseCredentials.username, databaseCredentials.password, {
      host: process.env.DATABASE_FQDN!,
      dialect: 'mysql',
      pool: {
        max: 2,
        min: 0,
        idle: 0,
        acquire: 3000,
        evict: 60000,
      },
    });
  }

  /**
   * Define the models for the database.
   */
  const { User, Team, Project, Membership, Target, Assignment, Beacon, Engagement, Schedule, Statistic } = defineModels(sequelize);

  /**
   * Perform the operation based on the request type.
   */
  switch (request.request_type) {
    /**
     * Users
     */
    case RequestType.GetUser:
      return User.findOne({ where: { id: (request as GetUserRequest).payload } });
    case RequestType.GetUserByEmail:
      return User.findOne({ where: { email: (request as GetUserRequest).payload } });
    case RequestType.GetUserBySub:
      return User.findOne({ where: { sub: (request as GetUserRequest).payload } });
    case RequestType.CreateUser:
      return User.create({ ...request });

    /**
     * Teams
     */
    case RequestType.ListTeamsBySub:
      // TODO: Filter by current sub
      return Team.findAll();
    case RequestType.GetTeam:
      return Team.findOne({ where: { id: (request as GetTeamRequest).payload } });

    /**
     * Features
     */
    case RequestType.ListFeaturesBySub:
      return Team.findAll();

    /**
     * Projects
     */
    case RequestType.ListProjects:
      return Project.findAll();
    case RequestType.ListProjectsByTeam:
      return Project.findAll({ where: { teams_id: request.payload } });
    case RequestType.GetProject:
      return Project.findOne({ where: { id: request.payload } });
    case RequestType.CreateProject:
      return Project.create({ ...request });

    /**
     * Memberships
     */
    case RequestType.ListMemberships:
      return Membership.findAll();
    case RequestType.ListMembershipsByUser:
      return Membership.findAll({ where: { users_id: request.payload } });
    case RequestType.ListMembershipsByTeam:
      return Membership.findAll({ where: { teams_id: request.payload } });
    case RequestType.GetMembership:
      return Membership.findOne({ where: { id: request.payload } });
    case RequestType.CreateMembership:
      return Membership.create({ ...request });

    /**
     * Assignments
     */
    case RequestType.ListAssignments:
      return Assignment.findAll();
    case RequestType.ListAssignmentsByProject:
      return Assignment.findAll({ where: { projects_id: request.payload } });
    case RequestType.ListAssignmentsByMembership:
      return Assignment.findAll({ where: { memberships_id: request.payload } });
    case RequestType.GetAssignment:
      return Assignment.findOne({ where: { id: request.payload } });
    case RequestType.CreateAssignment:
      return Assignment.create({ ...request });

    /**
     * Targets
     */
    case RequestType.ListTargets:
      return Target.findAll();
    case RequestType.ListTargetsByProject:
      return Target.findAll({ where: { projects_id: request.payload } });
    case RequestType.GetTarget:
      return Target.findOne({ where: { id: request.payload } });
    case RequestType.CreateTarget:
      return Target.create({ ...request });

    /**
     * Beacons
     */
    case RequestType.ListBeacons:
      return Beacon.findAll();
    case RequestType.ListBeaconsByTeam:
      return Beacon.findAll({ where: { teams_id: request.payload } });
    case RequestType.GetBeacon:
      return Beacon.findOne({ where: { id: request.payload } });
    case RequestType.CreateBeacon:
      return Beacon.create({ ...request });

    /**
     * Engagements
     */
    case RequestType.ListEngagements:
      return Engagement.findAll();
    case RequestType.ListEngagementsByTarget:
      return Engagement.findAll({ where: { targets_id: request.payload } });
    case RequestType.GetEngagement:
      return Engagement.findOne({ where: { id: request.payload } });
    case RequestType.CreateEngagement:
      return Engagement.create({ ...request });

    /**
     * Schedules
     */
    case RequestType.ListSchedules:
      return Schedule.findAll();
    case RequestType.ListSchedulesByTarget:
      return Schedule.findAll({ where: { targets_id: request.payload } });
    case RequestType.GetSchedule:
      return Schedule.findOne({ where: { id: request.payload } });
    case RequestType.CreateSchedule:
      return Schedule.create({ ...request });

    /**
     * Statistics
     */
    case RequestType.ListStatistics:
      return Statistic.findAll();
    case RequestType.ListStatisticsByTarget:
      return Statistic.findAll({ where: { targets_id: request.payload } });
    case RequestType.GetStatistic:
      return Statistic.findOne({ where: { id: request.payload } });
    case RequestType.CreateStatistic:
      return Statistic.create({ ...request });

    default:
      throw new Error('Invalid request type');
  }
};

export { main };
