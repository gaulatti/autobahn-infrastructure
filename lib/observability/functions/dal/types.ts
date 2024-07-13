export enum RequestType {
  GetUser = 'GetUser',
  GetUserBySub = 'GetUserBySub',
  ListUsers = 'ListUsers',
  GetUserByEmail = 'GetUserByEmail',
  CreateUser = 'CreateUser',
}

export interface BaseRequest {
  type: string;
}
export interface GetUserRequest extends BaseRequest {
  type: RequestType.GetUser | RequestType.GetUserBySub | RequestType.GetUserByEmail;
  payload: number | string;
}

export interface ListUsersRequest extends BaseRequest {
  type: RequestType.ListUsers;
}

export interface CreateUserRequest extends BaseRequest {
  type: RequestType.CreateUser;
  sub: string;
  email: string;
  name: string;
  last_name: string;
}

export type AllowedRequest = ListUsersRequest | GetUserRequest | CreateUserRequest;
