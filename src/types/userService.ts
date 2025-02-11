export interface UserDto {
  id: number;
  email: string;
  username?: string;
}

export interface AuthVerifyResponse {
  data: {
    id: number;
    email: string;
  };
}

export interface InternalUserResponse {
  data: UserDto;
}

export interface InternalUsersListResponse {
  data: UserDto[];
}

export interface UserSearchParams {
  username?: string;
  email?: string;
}

export interface UserServiceError {
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  error: UserServiceError;
} 