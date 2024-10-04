import { BaseRequest, RequestType } from '.';

export type GetRequestType =
  | RequestType.GetUser
  | RequestType.GetUserBySub
  | RequestType.GetUserBySubWithMembershipAndTeam
  | RequestType.GetUserByEmail
  | RequestType.GetTeam
  | RequestType.GetProjectByUUID
  | RequestType.GetMembership
  | RequestType.GetAssignment
  | RequestType.GetTarget
  | RequestType.GetTargetByUUID
  | RequestType.GetProject
  | RequestType.GetPulse
  | RequestType.GetPulseByUUID
  | RequestType.GetEngagement
  | RequestType.GetSchedule
  | RequestType.GetCurrentSchedules
  | RequestType.GetStatistic
  | RequestType.GetURL
  | RequestType.GetURLByUUID;

export interface GetRequest extends BaseRequest {
  payload: number | string;
  request_type: GetRequestType;
}
