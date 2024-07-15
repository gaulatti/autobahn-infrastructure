export enum RequestType {
  ListTeams = 'ListTeams',
  ListTeamsBySub = 'ListTeamsBySub',
  ListFeatures = 'ListFeatures',
  ListFeaturesBySub = 'ListFeaturesBySub',
  GetUser = 'GetUser',
  GetUserBySub = 'GetUserBySub',
  GetUserByEmail = 'GetUserByEmail',
  ListUsers = 'ListUsers',
  ListUsersByTeam = 'ListUsersByTeam',
  CreateUser = 'CreateUser',
}

export interface BaseRequest {
  type: string;
}
/**
 * The request object for getting a user.
 */
export interface GetUserRequest extends BaseRequest {
  type: RequestType.GetUser | RequestType.GetUserBySub | RequestType.GetUserByEmail;
  payload: number | string;
}

/**
 * The request object for getting teams.
 */
export interface ListTeamsRequest extends BaseRequest {
  type: RequestType.ListTeamsBySub;
  payload?: number | string;
}

/**
 * The request object for getting feature flags.
 */
export interface ListFeaturesRequest extends BaseRequest {
  type: RequestType.ListFeaturesBySub;
  payload?: number | string;
}

/**
 * The request object for getting users.
 */
export interface ListUsersRequest extends BaseRequest {
  type: RequestType.ListUsers | RequestType.ListUsersByTeam;
  payload?: number | string;
}

/**
 * The request object for creating a user.
 */
export interface CreateUserRequest extends BaseRequest {
  type: RequestType.CreateUser;
  sub: string;
  email: string;
  name: string;
  last_name: string;
}

export type AllowedFeaturesRequests = ListFeaturesRequest;
export type AllowedTeamsRequests = ListTeamsRequest;
export type AllowedUsersRequests = ListUsersRequest | GetUserRequest | CreateUserRequest;
export type AllowedRequest = AllowedUsersRequests | AllowedTeamsRequests | AllowedFeaturesRequests;
