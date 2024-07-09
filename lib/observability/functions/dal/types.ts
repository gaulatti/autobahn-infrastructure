export enum RequestType {
    GetUser = 'GetUser',
    CreateUser = 'CreateUser'
}

export interface BaseRequest {
  type: string;
}
export interface GetUserRequest extends BaseRequest {
  type: RequestType.GetUser;
  userId: string;
}

export interface CreateUserRequest extends BaseRequest {
  type: RequestType.CreateUser;
  username: string;
  email: string;
}

export type AllowedRequest = GetUserRequest | CreateUserRequest;
