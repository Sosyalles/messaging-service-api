import { Request, Response } from 'express';
import { 
  sendMessage, 
  getConversation, 
  getAllConversations,
  deleteMessage,
  getUnreadMessages,
  markMessageAsRead 
} from '../../src/controllers/MessageController';
import MessageService from '../../src/services/MessageService';
import { ApiResponse } from '../../src/utils/response';
import { AppError } from '../../src/utils/errors';
import { createMockRequest, createMockResponse, createMockMessage } from '../helpers/mockData';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

// Mock MessageService
jest.mock('../../src/services/MessageService');

describe('MessageController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    const validMessageData = {
      receiverId: 2,
      content: 'Test message'
    };

    it('should successfully send a message', async () => {
      const mockMessage = {
        id: 1,
        senderId: 1,
        ...validMessageData,
        isRead: false,
        createdAt: new Date()
      };

      mockRequest.body = validMessageData;
      (MessageService.sendMessage as jest.Mock).mockResolvedValue(mockMessage);

      await sendMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(MessageService.sendMessage).toHaveBeenCalledWith({
        senderId: mockRequest.user!.userId,
        ...validMessageData
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockMessage
        })
      );
    });

    it('should handle missing user context', async () => {
      mockRequest.user = undefined;
      mockRequest.body = validMessageData;

      await sendMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User context not found',
          statusCode: 401
        })
      );
    });

    it('should handle invalid receiverId', async () => {
      mockRequest.body = { ...validMessageData, receiverId: 'invalid' };

      await sendMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid receiver ID',
          statusCode: 400
        })
      );
    });

    it('should handle empty message content', async () => {
      mockRequest.body = { ...validMessageData, content: '' };

      await sendMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Message content cannot be empty',
          statusCode: 400
        })
      );
    });

    it('should handle message creation failure', async () => {
      mockRequest.body = validMessageData;
      (MessageService.sendMessage as jest.Mock).mockResolvedValue(null);

      await sendMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Failed to create message'
        })
      );
    });

    it('should handle service errors', async () => {
      const error = AppError.internal('Service error');
      mockRequest.body = validMessageData;
      (MessageService.sendMessage as jest.Mock).mockRejectedValue(error);

      await sendMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getConversation', () => {
    it('should retrieve conversation messages', async () => {
      const mockMessages = [
        { id: 1, senderId: 1, receiverId: 2, content: 'Hello', isRead: false },
        { id: 2, senderId: 2, receiverId: 1, content: 'Hi', isRead: true }
      ];

      mockRequest.params = { receiverId: '2' };
      (MessageService.getConversation as jest.Mock).mockResolvedValue(mockMessages);

      await getConversation(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(MessageService.getConversation).toHaveBeenCalledWith(1, 2);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockMessages
        })
      );
    });

    it('should handle empty conversations', async () => {
      mockRequest.params = { receiverId: '2' };
      (MessageService.getConversation as jest.Mock).mockResolvedValue([]);

      await getConversation(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No messages found in this conversation'
        })
      );
    });

    it('should handle invalid receiverId parameter', async () => {
      mockRequest.params = { receiverId: 'invalid' };

      await getConversation(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid receiver ID',
          statusCode: 400
        })
      );
    });

    it('should handle service errors in conversation retrieval', async () => {
      mockRequest.params = { receiverId: '2' };
      const error = AppError.internal('Database error');
      (MessageService.getConversation as jest.Mock).mockRejectedValue(error);

      await getConversation(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllConversations', () => {
    it('should successfully retrieve all conversations', async () => {
      const mockConversations = [
        {
          userId: 2,
          lastMessage: {
            id: 1,
            content: 'Hello',
            createdAt: new Date()
          }
        }
      ];

      (MessageService.getAllConversations as jest.Mock).mockResolvedValue(mockConversations);

      await getAllConversations(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(MessageService.getAllConversations).toHaveBeenCalledWith(mockRequest.user!.userId);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockConversations
        })
      );
    });

    it('should handle no conversations found', async () => {
      (MessageService.getAllConversations as jest.Mock).mockResolvedValue([]);

      await getAllConversations(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No conversations found'
        })
      );
    });
  });

  describe('getUnreadMessages', () => {
    it('should successfully retrieve unread messages', async () => {
      const mockUnreadMessages = [
        {
          id: 1,
          senderId: 2,
          content: 'New message',
          isRead: false,
          createdAt: new Date()
        }
      ];

      (MessageService.getUnreadMessages as jest.Mock).mockResolvedValue(mockUnreadMessages);

      await getUnreadMessages(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(MessageService.getUnreadMessages).toHaveBeenCalledWith(mockRequest.user!.userId);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUnreadMessages
        })
      );
    });

    it('should handle no unread messages', async () => {
      (MessageService.getUnreadMessages as jest.Mock).mockResolvedValue([]);

      await getUnreadMessages(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'No unread messages found'
        })
      );
    });
  });

  describe('markMessageAsRead', () => {
    it('should successfully mark message as read', async () => {
      mockRequest.params = { messageId: '1' };
      (MessageService.markMessageAsRead as jest.Mock).mockResolvedValue(undefined);

      await markMessageAsRead(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(MessageService.markMessageAsRead).toHaveBeenCalledWith(1, mockRequest.user!.userId);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Message marked as read'
        })
      );
    });

    it('should handle invalid messageId parameter', async () => {
      mockRequest.params = { messageId: 'invalid' };

      await markMessageAsRead(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid message ID',
          statusCode: 400
        })
      );
    });

    it('should handle unauthorized read attempt', async () => {
      mockRequest.params = { messageId: '1' };
      const error = AppError.authorization('Not authorized to mark this message as read');
      (MessageService.markMessageAsRead as jest.Mock).mockRejectedValue(error);

      await markMessageAsRead(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteMessage', () => {
    it('should successfully delete a message', async () => {
      mockRequest.params = { messageId: '1' };
      (MessageService.deleteMessage as jest.Mock).mockResolvedValue(undefined);

      await deleteMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(MessageService.deleteMessage).toHaveBeenCalledWith(1, mockRequest.user!.userId);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Message deleted successfully'
        })
      );
    });

    it('should handle deletion errors', async () => {
      const error = AppError.authorization('Not authorized');
      mockRequest.params = { messageId: '1' };
      (MessageService.deleteMessage as jest.Mock).mockRejectedValue(error);

      await deleteMessage(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });
}); 