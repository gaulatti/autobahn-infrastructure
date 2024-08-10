import { CreateRequests } from './create';
import { GetRequest } from './get';
import { ListRequest } from './lists';
import { UpdateBeaconRequest } from './update';

export enum RequestType {
  GetTeam = 'GetTeam',
  ListTeams = 'ListTeams',
  ListTeamsBySub = 'ListTeamsBySub',
  ListFeatures = 'ListFeatures',
  ListFeaturesBySub = 'ListFeaturesBySub',
  GetUser = 'GetUser',
  GetUserBySub = 'GetUserBySub',
  GetUserBySubWithMembershipAndTeam = 'GetUserBySubWithMembershipAndTeam',
  GetUserByEmail = 'GetUserByEmail',
  ListUsers = 'ListUsers',
  ListUsersByTeam = 'ListUsersByTeam',
  CreateUser = 'CreateUser',
  ListProjects = 'ListProjects',
  ListProjectsByTeam = 'ListProjectsByTeam',
  GetProject = 'GetProject',
  CreateProject = 'CreateProject',
  ListMemberships = 'ListMemberships',
  ListMembershipsByUser = 'ListMembershipsByUser',
  ListMembershipsByUserWithTeam = 'ListMembershipsByUserWithTeam',
  ListMembershipsByTeam = 'ListMembershipsByTeam',
  GetMembership = 'GetMembership',
  CreateMembership = 'CreateMembership',
  ListAssignments = 'ListAssignments',
  ListAssignmentsByProject = 'ListAssignmentsByProject',
  ListAssignmentsByMembership = 'ListAssignmentsByMembership',
  GetAssignment = 'GetAssignment',
  CreateAssignment = 'CreateAssignment',
  ListTargets = 'ListTargets',
  ListTargetsByProject = 'ListTargetsByProject',
  GetTarget = 'GetTarget',
  CreateTarget = 'CreateTarget',
  ListBeacons = 'ListBeacons',
  ListBeaconsByTeam = 'ListBeaconsByTeam',
  ListBeaconsByUser = 'ListBeaconsByUser',
  GetBeacon = 'GetBeacon',
  GetBeaconByUUID = 'GetBeaconByUUID',
  CreateBeacon = 'CreateBeacon',
  UpdateBeacon = 'UpdateBeacon',
  ListEngagements = 'ListEngagements',
  ListEngagementsByTarget = 'ListEngagementsByTarget',
  GetEngagement = 'GetEngagement',
  CreateEngagement = 'CreateEngagement',
  ListSchedules = 'ListSchedules',
  ListSchedulesByTarget = 'ListSchedulesByTarget',
  GetSchedule = 'GetSchedule',
  CreateSchedule = 'CreateSchedule',
  ListStatistics = 'ListStatistics',
  ListStatisticsByTarget = 'ListStatisticsByTarget',
  GetStatistic = 'GetStatistic',
  CreateStatistic = 'CreateStatistic',
}

export interface BaseRequest {
  request_type: RequestType;
}

export * from './get';
export * from './lists';
export * from './create';
export * from './update';

export type AllowedRequest = GetRequest | ListRequest | CreateRequests | UpdateBeaconRequest