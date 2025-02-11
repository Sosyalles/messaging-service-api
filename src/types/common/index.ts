export enum Environment {
  Development = 'development',
  Test = 'test',
  Production = 'production'
}

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

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ServiceResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
} 