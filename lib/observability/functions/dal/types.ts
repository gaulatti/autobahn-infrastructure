export enum RequestType {
  GetUser = 'GetUser',
  ListUsers = 'ListUsers',
  GetUserByEmail = 'GetUserByEmail',
  CreateUser = 'CreateUser',
}

export interface BaseRequest {
  type: string;
}
export interface GetUserRequest extends BaseRequest {
  type: RequestType.GetUser;
  id: number;
}
export interface ListUsersRequest extends BaseRequest {
  type: RequestType.ListUsers;
}
export interface GetUserByEmailRequest extends BaseRequest {
  type: RequestType.GetUserByEmail;
  email: string;
}

export interface CreateUserRequest extends BaseRequest {
  type: RequestType.CreateUser;
  sub: string;
  email: string;
  name: string;
  last_name: string;
}

export type AllowedRequest = ListUsersRequest | GetUserRequest | GetUserByEmailRequest | CreateUserRequest;
