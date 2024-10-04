import { CreateRequests } from './create';
import { GetRequest } from './get';
import { ListRequest } from './lists';
import { UpdateRequests } from './update';

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
  GetProjectByUUID = 'GetProjectByUUID',
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
  GetTargetByUUID = 'GetTargetByUUID',
  CreateTarget = 'CreateTarget',
  ListPulses = 'ListPulses',
  ListPulsesByTarget = 'ListPulsesByTarget',
  ListPulsesByUser = 'ListPulsesByUser',
  ListStatsPulsesByURL = 'ListStatsPulsesByURL',
  ListStatsPulsesByTarget = 'ListStatsPulsesByTarget',
  ListPulsesByURL = 'ListPulsesByURL',
  GetPulse = 'GetPulse',
  GetPulseByUUID = 'GetPulseByUUID',
  CreatePulse = 'CreatePulse',
  UpdatePulse = 'UpdatePulse',
  CreateHeartbeat = 'CreateHeartbeat',
  UpdateHeartbeat = 'UpdateHeartbeat',
  ListEngagements = 'ListEngagements',
  ListEngagementsByTarget = 'ListEngagementsByTarget',
  ListEngagementsByURL = 'ListEngagementsByURL',
  GetEngagement = 'GetEngagement',
  CreateEngagement = 'CreateEngagement',
  ListSchedules = 'ListSchedules',
  ListSchedulesByTarget = 'ListSchedulesByTarget',
  UpdateSchedule = 'UpdateSchedule',
  GetSchedule = 'GetSchedule',
  GetCurrentSchedules = 'GetCurrentSchedules',
  CreateSchedule = 'CreateSchedule',
  ListStatistics = 'ListStatistics',
  ListStatisticsByTarget = 'ListStatisticsByTarget',
  ListStatisticsByURL = 'ListStatisticsByURL',
  GetStatistic = 'GetStatistic',
  CreateStatistic = 'CreateStatistic',
  ListURLs = 'ListURLs',
  ListURLsByTarget = 'ListURLsByTarget',
  GetURL = 'GetURL',
  GetURLByUUID = 'GetURLByUUID',
  CreateURL = 'CreateURL',
  UpdateURL = 'UpdateURL',
  CreateBaseline = 'CreateBaseline',
  UpdateBaseline = 'UpdateBaseline',
}

export interface BaseRequest {
  request_type: RequestType;
}

export * from './create';
export * from './get';
export * from './lists';
export * from './update';

export type AllowedRequest = GetRequest | ListRequest | CreateRequests | UpdateRequests;