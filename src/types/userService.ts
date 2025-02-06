// Base API Response Type
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// User Types
export interface UserDto {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Service Response Types
export interface InternalUserResponse extends ApiResponse<UserDto> {}
export interface InternalUsersListResponse extends ApiResponse<UserDto[]> {}
export interface AuthVerifyResponse extends ApiResponse<{ id: number; email: string }> {}

// Search Parameters
export interface UserSearchParams {
  username?: string;
  email?: string;
}

// Error Types
export interface ApiErrorResponse {
  status: number;
  message: string;
  error?: string;
}

// Axios Error Types
export interface UserServiceError {
  response?: {
    status: number;
    data: ApiErrorResponse;
  };
  message: string;
} 