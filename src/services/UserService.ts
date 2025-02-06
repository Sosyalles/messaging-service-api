import axios, { isAxiosError } from 'axios';
import { env } from '../config/env.config';
import { AppError } from '../utils/errors';
import { 
  UserDto, 
  InternalUserResponse, 
  InternalUsersListResponse,
  UserSearchParams,
  UserServiceError,
  ApiErrorResponse
} from '../types/userService';

class UserService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.USER_SERVICE_API_KEY || '';
    this.baseUrl = env.USER_SERVICE_URL;
  }

  private get headers() {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  private handleError(error: unknown): never {
    if (isAxiosError(error) && error.response) {
      switch (error.response.status) {
        case 404:
          throw AppError.notFound('User not found');
        case 401:
          throw AppError.authentication('Invalid API key');
        case 403:
          throw AppError.authorization('Access denied');
        default:
          throw AppError.internal(error.response.data?.message || 'Error fetching user data');
      }
    }
    throw AppError.internal('Service unavailable');
  }

  async getUserById(userId: number): Promise<UserDto> {
    try {
      const response = await axios.get<InternalUserResponse>(
        `${this.baseUrl}/api/internal/users/${userId}`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserByUsername(username: string): Promise<UserDto> {
    try {
      const response = await axios.get<InternalUserResponse>(
        `${this.baseUrl}/api/internal/users/username/${username}`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getUserByEmail(email: string): Promise<UserDto> {
    try {
      const response = await axios.get<InternalUserResponse>(
        `${this.baseUrl}/api/internal/users/email/${email}`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    try {
      const response = await axios.get<InternalUsersListResponse>(
        `${this.baseUrl}/api/internal/users/list`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchUsers(params: UserSearchParams): Promise<UserDto[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.username) queryParams.append('username', params.username);
      if (params.email) queryParams.append('email', params.email);

      const response = await axios.get<InternalUsersListResponse>(
        `${this.baseUrl}/api/users/search?${queryParams.toString()}`,
        { headers: this.headers }
      );
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async validateUser(userId: number): Promise<boolean> {
    try {
      await this.getUserById(userId);
      return true;
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }
}

export default new UserService(); 