import { BaseRequest, RequestType } from '.';

export interface CreateUserRequest extends BaseRequest {
  request_type: RequestType.CreateUser;
  sub: string;
  email: string;
  name: string;
  last_name: string;
}

export interface CreateProjectRequest extends BaseRequest {
  request_type: RequestType.CreateProject;
  teams_id: number;
  name: string;
}
export interface CreateMembershipRequest extends BaseRequest {
  request_type: RequestType.CreateMembership;
  users_id: number;
  teams_id: number;
  role: number;
}

export interface CreateAssignmentRequest extends BaseRequest {
  request_type: RequestType.CreateAssignment;
  projects_id: number;
  memberships_id: number;
  role: number;
}

export interface CreateTargetRequest extends BaseRequest {
  request_type: RequestType.CreateTarget;
  projects_id: number;
  stage: number;
  provider: number;
  name: string;
  url?: string;
  lambda_arn?: string;
}

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

export interface CreateEngagementRequest extends BaseRequest {
  request_type: RequestType.CreateEngagement;
  targets_id: number;
  bounce_rate: number;
  mode: number;
  date_from: Date;
  date_to: Date;
}
export interface CreateScheduleRequest extends BaseRequest {
  request_type: RequestType.CreateSchedule;
  targets_id: number;
  provider: number;
  cron: string;
  next_execution: Date;
}
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

export type CreateRequests = CreateUserRequest | CreateProjectRequest | CreateMembershipRequest | CreateAssignmentRequest | CreateTargetRequest | CreateBeaconRequest | CreateEngagementRequest | CreateScheduleRequest | CreateStatisticRequest;