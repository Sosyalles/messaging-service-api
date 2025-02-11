import MessageService from '../../src/services/MessageService';
import MessageRepository from '../../src/repositories/MessageRepository';
import { messageQueueProducer } from '../../src/utils/rabbitmqProducer';
import { getSocketService } from '../../src/config/socket.config';
import { AppError } from '../../src/utils/errors';

// Mock dependencies
jest.mock('../../src/repositories/MessageRepository');
jest.mock('../../src/utils/rabbitmqProducer');
jest.mock('../../src/config/socket.config');

describe('MessageService', () => {
  const mockSocketService = {
    isUserOnline: jest.fn(),
    sendNotification: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getSocketService as jest.Mock).mockReturnValue(mockSocketService);
  });

  describe('sendMessage', () => {
    const validMessageData = {
      senderId: 1,
      receiverId: 2,
      content: 'Test message'
    };

    it('should successfully create and send a message', async () => {
      const mockMessage = {
        id: 1,
        ...validMessageData,
        isRead: false,
        createdAt: new Date()
      };

      (MessageRepository.createMessage as jest.Mock).mockResolvedValue(mockMessage);
      mockSocketService.isUserOnline.mockReturnValue(true);

      const result = await MessageService.sendMessage(validMessageData);

      expect(MessageRepository.createMessage).toHaveBeenCalledWith(validMessageData);
      expect(mockSocketService.isUserOnline).toHaveBeenCalledWith(validMessageData.receiverId);
      expect(mockSocketService.sendNotification).toHaveBeenCalledWith(
        validMessageData.receiverId,
        'new-message',
        expect.objectContaining({
          message: mockMessage,
          senderId: validMessageData.senderId
        })
      );
      expect(messageQueueProducer.publishToQueue).toHaveBeenCalledWith(
        'new_message',
        expect.objectContaining({
          messageId: mockMessage.id,
          senderId: mockMessage.senderId,
          receiverId: mockMessage.receiverId,
          content: mockMessage.content
        })
      );
      expect(result).toEqual(mockMessage);
    });

    it('should throw validation error for invalid message data', async () => {
      const invalidData = {
        senderId: 1,
        receiverId: 2,
        content: ''  // Empty content should trigger validation error
      };

      await expect(MessageService.sendMessage(invalidData))
        .rejects
        .toThrow('Invalid message data: senderId, receiverId and content are required');
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      (MessageRepository.createMessage as jest.Mock).mockRejectedValue(error);

      await expect(MessageService.sendMessage(validMessageData))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('deleteMessage', () => {
    const messageId = 1;
    const userId = 1;

    it('should successfully delete a message', async () => {
      const mockMessage = {
        id: messageId,
        senderId: userId,
        receiverId: 2,
        content: 'Test message'
      };

      (MessageRepository.getMessage as jest.Mock).mockResolvedValue(mockMessage);
      (MessageRepository.deleteMessage as jest.Mock).mockResolvedValue(undefined);
      mockSocketService.isUserOnline.mockReturnValue(true);

      await MessageService.deleteMessage(messageId, userId);

      expect(MessageRepository.getMessage).toHaveBeenCalledWith(messageId);
      expect(MessageRepository.deleteMessage).toHaveBeenCalledWith(messageId);
      expect(messageQueueProducer.publishToQueue).toHaveBeenCalledWith(
        'message_deleted',
        expect.objectContaining({
          messageId,
          deletedBy: userId
        })
      );
    });

    it('should throw error when message does not exist', async () => {
      (MessageRepository.getMessage as jest.Mock).mockResolvedValue(null);

      await expect(MessageService.deleteMessage(messageId, userId))
        .rejects
        .toThrow('Message not found');
    });

    it('should throw error when user is not authorized to delete message', async () => {
      const mockMessage = {
        id: messageId,
        senderId: 2,
        receiverId: 3,
        content: 'Test message'
      };

      (MessageRepository.getMessage as jest.Mock).mockResolvedValue(mockMessage);

      await expect(MessageService.deleteMessage(messageId, userId))
        .rejects
        .toThrow('Not authorized');
    });
  });

  describe('markMessageAsRead', () => {
    const messageId = 1;
    const userId = 1;

    it('should successfully mark message as read', async () => {
      const mockMessage = {
        id: messageId,
        senderId: 2,
        receiverId: userId,
        content: 'Test message',
        isRead: false
      };

      (MessageRepository.getMessage as jest.Mock).mockResolvedValue(mockMessage);
      (MessageRepository.markMessageAsRead as jest.Mock).mockResolvedValue(undefined);
      mockSocketService.isUserOnline.mockReturnValue(true);

      await MessageService.markMessageAsRead(messageId, userId);

      expect(MessageRepository.getMessage).toHaveBeenCalledWith(messageId);
      expect(MessageRepository.markMessageAsRead).toHaveBeenCalledWith(messageId);
      expect(messageQueueProducer.publishToQueue).toHaveBeenCalledWith(
        'message_read',
        expect.objectContaining({
          messageId,
          readBy: userId
        })
      );
    });

    it('should throw error when message does not exist', async () => {
      (MessageRepository.getMessage as jest.Mock).mockResolvedValue(null);

      await expect(MessageService.markMessageAsRead(messageId, userId))
        .rejects
        .toThrow('Message not found');
    });

    it('should throw error when user is not the receiver', async () => {
      const mockMessage = {
        id: messageId,
        senderId: 2,
        receiverId: 3,
        content: 'Test message',
        isRead: false
      };

      (MessageRepository.getMessage as jest.Mock).mockResolvedValue(mockMessage);

      await expect(MessageService.markMessageAsRead(messageId, userId))
        .rejects
        .toThrow('Not authorized');
    });
  });
}); 