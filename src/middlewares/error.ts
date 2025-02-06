import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/response';
import { isCelebrateError } from 'celebrate';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with our custom logger
  logger.logRequest(req, res, err);

  // Celebrate validation errors
  if (isCelebrateError(err)) {
    const validationError = Array.from(err.details.values()).map(
      error => error.details[0].message
    ).join(', ');
    
    return res
      .status(400)
      .json(ApiResponse.error(validationError, 400));
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res
      .status(400)
      .json(ApiResponse.error(err.message, 400));
  }

  // Custom application errors
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(ApiResponse.error(err.message, err.statusCode));
  }

  // Default to 500 server error
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return res
    .status(500)
    .json(ApiResponse.error(errorMessage, 500));
}; 