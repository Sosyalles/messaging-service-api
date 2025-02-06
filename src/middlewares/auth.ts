import { Request, Response, NextFunction } from 'express';
import axios, { isAxiosError } from 'axios';
import { AppError } from '../utils/errors';
import { AuthVerifyResponse, ApiErrorResponse } from '../types/userService';

interface JwtPayload {
  userId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw AppError.authentication('No token provided');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      throw AppError.authentication('Invalid token format');
    }

    try {
      const response = await axios.get<AuthVerifyResponse>(
        `${process.env.USER_SERVICE_URL}/auth/verify`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data?.data?.id || !response.data?.data?.email) {
        throw AppError.authentication('Invalid user data received');
      }

      req.user = {
        userId: response.data.data.id,
        email: response.data.data.email
      };
      
      next();
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw AppError.authentication('Invalid or expired token');
        }
        if (error.response?.status === 403) {
          throw AppError.authorization('Access denied');
        }
      }
      throw AppError.internal('Authentication service unavailable');
    }
  } catch (error) {
    next(error);
  }
}; 