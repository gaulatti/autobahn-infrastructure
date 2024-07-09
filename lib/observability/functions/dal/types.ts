export enum RequestType {
    GetUser = 'GetUser',
    CreateUser = 'CreateUser'
}

export interface BaseRequest {
  type: string;
}
export interface GetUserRequest extends BaseRequest {
  type: RequestType.GetUser;
  userId: number;
}

export interface CreateUserRequest extends BaseRequest {
  type: RequestType.CreateUser;
  email: string;
}

export type AllowedRequest = GetUserRequest | CreateUserRequest;
