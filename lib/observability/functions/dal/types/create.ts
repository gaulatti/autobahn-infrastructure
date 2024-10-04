import { BaseRequest, RequestType } from '.';

export interface CreateUserRequest extends BaseRequest {
  request_type: RequestType.CreateUser;
  sub: string;
}

export interface CreateProjectRequest extends BaseRequest {
  request_type: RequestType.CreateProject;
  teams_id: number;
  name: string;
  uuid: string;
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
  stage: number;
  provider: number;
  name: string;
  url_id?: number;
  lambda_arn?: string;
}

export interface CreatePulseRequest extends BaseRequest {
  request_type: RequestType.CreatePulse;
  stage: number;
  uuid: string;
  url_id: number;
  provider: number;
  targets_id?: number;
  triggered_by?: number;
}

export interface CreateHeartbeatRequest extends BaseRequest {
  request_type: RequestType.CreateHeartbeat;
  pulses_id: number;
  mode: number;
  status: number;
}

export interface CreateEngagementRequest extends BaseRequest {
  request_type: RequestType.CreateEngagement;
  url_id: number;
  bounce_rate: number;
  mode: number;
  date_from: Date;
  date_to: Date;
}

export interface CreateScheduleRequest extends BaseRequest {
  request_type: RequestType.CreateSchedule;
  projects_id: number;
  targets_id: number;
  provider: number;
  cron: string;
  next_execution: Date;
}

export interface CreateStatisticRequest extends BaseRequest {
  request_type: RequestType.CreateStatistic;
  url_id: number;
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
  date_from: Date;
  date_to: Date;
}

export interface CreateURLRequest extends BaseRequest {
  request_type: RequestType.CreateURL;
  url: string;
  uuid: string;
}

export interface CreateBaselineRequest extends BaseRequest {
  request_type: RequestType.CreateBaseline;
  targets_id: number;
  ttfb: number;
  fcp: number;
  lcp: number;
  tti: number;
  si: number;
  cls: number;
  mode: number;
}

export type CreateRequests =
  | CreateUserRequest
  | CreateProjectRequest
  | CreateMembershipRequest
  | CreateAssignmentRequest
  | CreateTargetRequest
  | CreatePulseRequest
  | CreateHeartbeatRequest
  | CreateEngagementRequest
  | CreateScheduleRequest
  | CreateStatisticRequest
  | CreateBaselineRequest
  | CreateURLRequest;
