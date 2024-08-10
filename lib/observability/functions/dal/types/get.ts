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
  | RequestType.GetBeacon
  | RequestType.GetBeaconByUUID
  | RequestType.GetEngagement
  | RequestType.GetSchedule
  | RequestType.GetStatistic;

export interface GetRequest extends BaseRequest {
  payload: number | string;
  request_type: GetRequestType;
}
