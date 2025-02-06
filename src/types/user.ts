// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication related types
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

export interface AuthResponse {
  token: string;
  user: User;
}

// API Response types
export interface ApiErrorResponse {
  status: number;
  message: string;
  errors?: string[];
}

export interface ApiSuccessResponse<T> {
  status: number;
  data: T;
  message: string;
}

// Follower related types
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