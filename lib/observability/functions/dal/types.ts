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

/**
 * The request object for getting a user.
 */
export interface GetUserRequest extends BaseRequest {
  request_type: RequestType.GetUser | RequestType.GetUserBySub | RequestType.GetUserBySubWithMembershipAndTeam | RequestType.GetUserByEmail;
  payload: number | string;
}

/**
 * The request object for getting teams.
 */
export interface ListTeamsRequest extends BaseRequest {
  request_type: RequestType.ListTeamsBySub;
  payload?: number | string;
}

export interface GetTeamRequest extends BaseRequest {
  request_type: RequestType.GetTeam;
  payload: number;
}

/**
 * The request object for getting feature flags.
 */
export interface ListFeaturesRequest extends BaseRequest {
  request_type: RequestType.ListFeaturesBySub;
  payload?: number | string;
}

/**
 * The request object for getting users.
 */
export interface ListUsersRequest extends BaseRequest {
  request_type: RequestType.ListUsers | RequestType.ListUsersByTeam;
  payload?: number | string;
}

/**
 * The request object for creating a user.
 */
export interface CreateUserRequest extends BaseRequest {
  request_type: RequestType.CreateUser;
  sub: string;
  email: string;
  name: string;
  last_name: string;
}

/**
 * The request object for getting projects.
 */
export interface ListProjectsRequest extends BaseRequest {
  request_type: RequestType.ListProjects | RequestType.ListProjectsByTeam;
  payload?: number;
}

/**
 * The request object for getting a single project.
 */
export interface GetProjectRequest extends BaseRequest {
  request_type: RequestType.GetProject;
  payload: number;
}

/**
 * The request object for creating a project.
 */
export interface CreateProjectRequest extends BaseRequest {
  request_type: RequestType.CreateProject;
  teams_id: number;
  name: string;
}

/**
 * The request object for getting memberships.
 */
export interface ListMembershipsRequest extends BaseRequest {
  request_type: RequestType.ListMemberships | RequestType.ListMembershipsByUser | RequestType.ListMembershipsByUserWithTeam | RequestType.ListMembershipsByTeam;
  payload?: number;
}

/**
 * The request object for getting a single membership.
 */
export interface GetMembershipRequest extends BaseRequest {
  request_type: RequestType.GetMembership;
  payload: number;
}

/**
 * The request object for creating a membership.
 */
export interface CreateMembershipRequest extends BaseRequest {
  request_type: RequestType.CreateMembership;
  users_id: number;
  teams_id: number;
  role: number;
}

/**
 * The request object for getting assignments.
 */
export interface ListAssignmentsRequest extends BaseRequest {
  request_type: RequestType.ListAssignments | RequestType.ListAssignmentsByProject | RequestType.ListAssignmentsByMembership;
  payload?: number;
}

/**
 * The request object for getting a single assignment.
 */
export interface GetAssignmentRequest extends BaseRequest {
  request_type: RequestType.GetAssignment;
  payload: number;
}

/**
 * The request object for creating an assignment.
 */
export interface CreateAssignmentRequest extends BaseRequest {
  request_type: RequestType.CreateAssignment;
  projects_id: number;
  memberships_id: number;
  role: number;
}

/**
 * The request object for getting targets.
 */
export interface ListTargetsRequest extends BaseRequest {
  request_type: RequestType.ListTargets | RequestType.ListTargetsByProject;
  payload?: number;
}

/**
 * The request object for getting a single target.
 */
export interface GetTargetRequest extends BaseRequest {
  request_type: RequestType.GetTarget;
  payload: number;
}

/**
 * The request object for creating a target.
 */
export interface CreateTargetRequest extends BaseRequest {
  request_type: RequestType.CreateTarget;
  projects_id: number;
  stage: number;
  provider: number;
  name: string;
  url?: string;
  lambda_arn?: string;
}

/**
 * The request object for getting beacons.
 */
export interface ListBeaconsRequest extends BaseRequest {
  request_type: RequestType.ListBeacons | RequestType.ListBeaconsByUser | RequestType.ListBeaconsByTeam;
  payload?: number | number[];
}

/**
 * The request object for getting a single beacon.
 */
export interface GetBeaconRequest extends BaseRequest {
  request_type: RequestType.GetBeacon | RequestType.GetBeaconByUUID;
  payload: number | string;
}

/**
 * The request object for creating a beacon.
 */
export interface CreateBeaconRequest extends BaseRequest {
  request_type: RequestType.CreateBeacon;
  teams_id: number;
  stage: number;
  uuid: string;
  url: string;
  provider: number;
  type: number;
  mode: number;
  status: number;
  fcp?: number;
  lcp?: number;
  tti?: number;
  si?: number;
  cls?: number;
  performance_score?: number;
  pleasantness_score?: number;
  ended_at?: Date;
  targets_id?: number;
  triggered_by?: number;
}

export interface UpdateBeaconRequest extends BaseRequest {
  request_type: RequestType.UpdateBeacon;
  id: number;
  status: number;
  ttfb: number;
  fcp: number;
  dcl: number;
  lcp: number;
  tti: number;
  si: number;
  cls: number;
  screenshots?: { timestamp: number }[];
  performance_score: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
  pleasantness_score?: number;
  ended_at?: Date;
}

/**
 * The request object for getting engagements.
 */
export interface ListEngagementsRequest extends BaseRequest {
  request_type: RequestType.ListEngagements | RequestType.ListEngagementsByTarget;
  payload?: number;
}

/**
 * The request object for getting a single engagement.
 */
export interface GetEngagementRequest extends BaseRequest {
  request_type: RequestType.GetEngagement;
  payload: number;
}

/**
 * The request object for creating an engagement.
 */
export interface CreateEngagementRequest extends BaseRequest {
  request_type: RequestType.CreateEngagement;
  targets_id: number;
  bounce_rate: number;
  mode: number;
  date_from: Date;
  date_to: Date;
}

/**
 * The request object for getting schedules.
 */
export interface ListSchedulesRequest extends BaseRequest {
  request_type: RequestType.ListSchedules | RequestType.ListSchedulesByTarget;
  payload?: number;
}

/**
 * The request object for getting a single schedule.
 */
export interface GetScheduleRequest extends BaseRequest {
  request_type: RequestType.GetSchedule;
  payload: number;
}

/**
 * The request object for creating a schedule.
 */
export interface CreateScheduleRequest extends BaseRequest {
  request_type: RequestType.CreateSchedule;
  targets_id: number;
  provider: number;
  cron: string;
  next_execution: Date;
}

/**
 * The request object for getting statistics.
 */
export interface ListStatisticsRequest extends BaseRequest {
  request_type: RequestType.ListStatistics | RequestType.ListStatisticsByTarget;
  payload?: number;
}

/**
 * The request object for getting a single statistic.
 */
export interface GetStatisticRequest extends BaseRequest {
  request_type: RequestType.GetStatistic;
  payload: number;
}

/**
 * The request object for creating a statistic.
 */
export interface CreateStatisticRequest extends BaseRequest {
  request_type: RequestType.CreateStatistic;
  targets_id: number;
  provider: number;
  period: number;
  statistic: number;
  fcp: number;
  lcp: number;
  tti: number;
  si: number;
  cls: number;
  mode: number;
  count: number;
  performance_score: number;
  pleasantness_score?: number;
  date_from: Date;
  date_to: Date;
}

export type AllowedFeaturesRequests = ListFeaturesRequest;
export type AllowedTeamsRequests = ListTeamsRequest | GetTeamRequest;
export type AllowedUsersRequests = ListUsersRequest | GetUserRequest | CreateUserRequest;
export type AllowedProjectsRequests = ListProjectsRequest | GetProjectRequest | CreateProjectRequest;
export type AllowedMembershipsRequests = ListMembershipsRequest | GetMembershipRequest | CreateMembershipRequest;
export type AllowedAssignmentsRequests = ListAssignmentsRequest | GetAssignmentRequest | CreateAssignmentRequest;
export type AllowedTargetsRequests = ListTargetsRequest | GetTargetRequest | CreateTargetRequest;
export type AllowedBeaconsRequests = ListBeaconsRequest | GetBeaconRequest | CreateBeaconRequest | UpdateBeaconRequest;
export type AllowedEngagementsRequests = ListEngagementsRequest | GetEngagementRequest | CreateEngagementRequest;
export type AllowedSchedulesRequests = ListSchedulesRequest | GetScheduleRequest | CreateScheduleRequest;
export type AllowedStatisticsRequests = ListStatisticsRequest | GetStatisticRequest | CreateStatisticRequest;
export type AllowedRequest =
  | AllowedUsersRequests
  | AllowedTeamsRequests
  | AllowedFeaturesRequests
  | AllowedProjectsRequests
  | AllowedMembershipsRequests
  | AllowedAssignmentsRequests
  | AllowedTargetsRequests
  | AllowedBeaconsRequests
  | AllowedEngagementsRequests
  | AllowedSchedulesRequests
  | AllowedStatisticsRequests;
