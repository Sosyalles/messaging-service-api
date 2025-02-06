export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  private constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static validation(message: string): AppError {
    return new AppError(message, 400);
  }

  static authentication(message: string = 'Authentication failed'): AppError {
    return new AppError(message, 401);
  }

  static authorization(message: string = 'Not authorized'): AppError {
    return new AppError(message, 403);
  }

  static notFound(resource: string = 'Resource'): AppError {
    return new AppError(`${resource} not found`, 404);
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500);
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400);
  }
}