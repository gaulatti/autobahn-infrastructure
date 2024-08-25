import { BaseRequest, RequestType } from '.';

export type GetRequestType =
  | RequestType.GetUser
  | RequestType.GetUserBySub
  | RequestType.GetUserBySubWithMembershipAndTeam
  | RequestType.GetUserByEmail
  | RequestType.GetTeam
  | RequestType.GetProject
  | RequestType.GetMembership
  | RequestType.GetAssignment
  | RequestType.GetTarget
  | RequestType.GetPulse
  | RequestType.GetPulseByUUID
  | RequestType.GetEngagement
  | RequestType.GetSchedule
  | RequestType.GetStatistic
  | RequestType.GetURL
  | RequestType.GetURLByUUID;

export interface GetRequest extends BaseRequest {
  payload: number | string;
  request_type: GetRequestType;
}
