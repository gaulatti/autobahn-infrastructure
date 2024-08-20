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

export type UpdateRequests = UpdateHeartbeatRequest;
