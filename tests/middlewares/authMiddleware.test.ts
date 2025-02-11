import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/middlewares/auth';
import axios from 'axios';
import { AppError } from '../../src/utils/errors';
import { env } from '../../src/config/env.config';

jest.mock('axios');
jest.mock('crypto', () => ({
  randomUUID: () => 'test-uuid'
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      ip: '127.0.0.1'
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should authenticate valid token', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    mockRequest.headers = {
      authorization: 'Bearer valid-token'
    };

    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: mockUser
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(axios.get).toHaveBeenCalledWith(
      `${env.USER_SERVICE_URL}/auth/verify`,
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer valid-token',
          'X-Client-IP': '127.0.0.1',
          'X-Request-ID': 'test-uuid'
        }
      })
    );
    expect(mockRequest.user).toEqual({
      userId: mockUser.id,
      email: mockUser.email
    });
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should handle missing authorization header', async () => {
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No authorization header provided',
        statusCode: 401
      })
    );
  });

  it('should handle invalid token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token'
    };

    (axios.get as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 401
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid or expired token',
        statusCode: 401
      })
    );
  });

  it('should handle access denied', async () => {
    mockRequest.headers = {
      authorization: 'Bearer forbidden-token'
    };

    (axios.get as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 403
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Access denied',
        statusCode: 403
      })
    );
  });

  it('should handle service unavailable', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-token'
    };

    (axios.get as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 500
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Authentication service unavailable',
        statusCode: 500
      })
    );
  });

  it('should handle invalid user data', async () => {
    mockRequest.headers = {
      authorization: 'Bearer valid-token'
    };

    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: {
        data: null
      }
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid user data received',
        statusCode: 401
      })
    );
  });
}); 