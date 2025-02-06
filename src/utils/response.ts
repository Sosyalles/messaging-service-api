export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;

  constructor(success: boolean, message: string, data?: T, statusCode: number = 200) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(data?: T, message: string = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, message, data, 200);
  }

  static error(message: string = 'Error occurred', statusCode: number = 500): ApiResponse {
    return new ApiResponse(false, message, undefined, statusCode);
  }

  static created<T>(data?: T, message: string = 'Resource created'): ApiResponse<T> {
    return new ApiResponse(true, message, data, 201);
  }

  static noContent(message: string = 'No content'): ApiResponse {
    return new ApiResponse(true, message, undefined, 204);
  }
} 