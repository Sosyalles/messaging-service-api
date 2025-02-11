import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

const MAX_BODY_SIZE = 100 * 1024; // 100KB limit for general requests
const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB limit for message content

export const bodySizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');

  // Check if it's a message-related endpoint
  const isMessageEndpoint = req.path.includes('/messages');
  const maxSize = isMessageEndpoint ? MAX_MESSAGE_SIZE : MAX_BODY_SIZE;

  if (contentLength > maxSize) {
    throw AppError.validation(`Request body too large. Maximum size is ${maxSize / 1024}KB`);
  }

  next();
}; 