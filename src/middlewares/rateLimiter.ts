import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';
import { AppError } from '../utils/errors';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw AppError.tooManyRequests('Rate limit exceeded');
  }
});

// More strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw AppError.tooManyRequests('Too many authentication attempts');
  }
});

// Message sending rate limiter
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 messages per minute
  message: 'Message sending rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw AppError.tooManyRequests('Message sending rate limit exceeded');
  }
}); 