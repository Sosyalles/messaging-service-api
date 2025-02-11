export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface UserCreateRequest extends RegisterRequest {
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FollowerInfo {
  userId: number;
  username: string;
  fullName?: string;
  followedAt: Date;
}

export interface FollowingInfo extends FollowerInfo {}

export interface UserWithFollowInfo extends User {
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

// User Service Types
export interface UserServiceResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

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

export interface UserSearchParams {
  username?: string;
  email?: string;
}

export interface InternalUserResponse extends UserServiceResponse<UserDto> {}
export interface InternalUsersListResponse extends UserServiceResponse<UserDto[]> {}
export interface AuthVerifyResponse extends UserServiceResponse<{
  id: number;
  email: string;
}> {}

export interface UserServiceError {
  response?: {
    status: number;
    data: {
      status: number;
      message: string;
      error?: string;
    };
  };
  message: string;
} 