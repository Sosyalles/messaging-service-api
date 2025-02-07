import { Request, Response, NextFunction } from 'express';
import axios, { isAxiosError } from 'axios';
import { AppError } from '../utils/errors';
import { AuthVerifyResponse } from '../types/userService';
import { env } from '../config/env.config';
import { randomUUID } from 'crypto';

interface AuthenticatedUser {
  userId: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
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
      throw AppError.authentication('No authorization header provided');
    }

    try {
      const response = await axios.get<AuthVerifyResponse>(
        `${env.USER_SERVICE_URL}/auth/verify`,
        { 
          headers: { 
            Authorization: authHeader,
            'X-Client-IP': req.ip,
            'X-Request-ID': randomUUID()
          },
          timeout: 5000
        }
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
        throw AppError.internal('Authentication service unavailable');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}; 