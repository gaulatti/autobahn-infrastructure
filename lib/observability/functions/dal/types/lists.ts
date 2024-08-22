import { RequestType } from '.';

export interface ListRenderingParams {
  startRow: string;
  endRow: string;
  sort: string;
  filters: string;
}

export type ListRequestType = RequestType.ListTeamsBySub
  | RequestType.ListFeaturesBySub
  | RequestType.ListUsers
  | RequestType.ListUsersByTeam
  | RequestType.ListProjects
  | RequestType.ListProjectsByTeam
  | RequestType.ListMemberships
  | RequestType.ListMembershipsByUser
  | RequestType.ListMembershipsByUserWithTeam
  | RequestType.ListMembershipsByTeam
  | RequestType.ListAssignments
  | RequestType.ListAssignmentsByProject
  | RequestType.ListAssignmentsByMembership
  | RequestType.ListTargets
  | RequestType.ListTargetsByProject
  | RequestType.ListPulses
  | RequestType.ListPulsesByUser
  | RequestType.ListPulsesByTeam
  | RequestType.ListEngagements
  | RequestType.ListEngagementsByTarget
  | RequestType.ListEngagementsByURL
  | RequestType.ListSchedules
  | RequestType.ListSchedulesByTarget
  | RequestType.ListStatistics
  | RequestType.ListStatisticsByTarget
  | RequestType.ListStatisticsByURL;

export interface ListRequest {
  params?: ListRenderingParams;
  request_type: ListRequestType;
  payload?: number | number[] | string;
}
