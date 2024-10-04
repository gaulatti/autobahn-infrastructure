import { BaseRequest, RequestType } from '.';

export interface UpdateHeartbeatRequest extends BaseRequest {
  request_type: RequestType.UpdateHeartbeat;
  id: number;
  retries?: number;
  ttfb?: number;
  fcp?: number;
  dcl?: number;
  lcp?: number;
  tti?: number;
  si?: number;
  cls?: number;
  screenshots?: { timestamp: number }[];
  performance_score?: number;
  accessibility_score?: number;
  best_practices_score?: number;
  seo_score?: number;
  ended_at?: Date;
  status?: number;
}

export interface UpdateURLRequest extends BaseRequest {
  request_type: RequestType.UpdateURL;
  id: number;
  url: string;
}

export interface UpdateScheduleRequest extends BaseRequest {
  request_type: RequestType.UpdateSchedule;
  id: number;
  cron?: string;
  next_execution?: Date;
}

export interface UpdateBaselineRequest extends BaseRequest {
  targets_id: number;
  mode: number;
  ttfb?: number;
  fcp?: number;
  dcl?: number;
  lcp?: number;
  tti?: number;
  si?: number;
}

export type UpdateRequests = UpdateHeartbeatRequest | UpdateURLRequest | UpdateScheduleRequest | UpdateBaselineRequest;
