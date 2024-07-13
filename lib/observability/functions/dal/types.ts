export enum RequestType {
    GetUser = 'GetUser',
    GetUserByEmail = 'GetUserByEmail',
    CreateUser = 'CreateUser'
}

export interface BaseRequest {
  type: string;
}
export interface GetUserRequest extends BaseRequest {
  type: RequestType.GetUser;
  id: number;
}
export interface GetUserByEmailRequest extends BaseRequest {
  type: RequestType.GetUserByEmail;
  email: string;
}

export interface CreateUserRequest extends BaseRequest {
  type: RequestType.CreateUser;
  email: string;
}

export type AllowedRequest = GetUserRequest | GetUserByEmailRequest | CreateUserRequest;
