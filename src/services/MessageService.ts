import { Message, SendMessageDTO } from '../types/message';
import { getSocketService } from '../config/socket.config';
import { AppError } from '../utils/errors';
import MessageRepository from '../repositories/MessageRepository';
import { messageQueueProducer } from '../utils/rabbitmqProducer';

// Queue names
const QUEUES = {
  NEW_MESSAGE: 'new_message',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_READ: 'message_read'
} as const;

class MessageService {
  async sendMessage(messageData: SendMessageDTO): Promise<Message> {
    if (!messageData.senderId || !messageData.receiverId || !messageData.content) {
      throw AppError.validation('Invalid message data: senderId, receiverId and content are required');
    }

    const message = await MessageRepository.createMessage(messageData);

    // Send real-time notification via Socket.IO
    const socketService = getSocketService();
    if (socketService.isUserOnline(messageData.receiverId)) {
      socketService.sendNotification(messageData.receiverId, 'new-message', {
        message,
        senderId: messageData.senderId
      });
    }

    // Publish to RabbitMQ
    try {
      await messageQueueProducer.publishToQueue(QUEUES.NEW_MESSAGE, {
        messageId: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.createdAt
      });
    } catch (error) {
      console.error('Failed to publish message to queue:', error);
      // Don't throw error here, as the message is already saved
    }

    return message;
  }

  async getConversation(userId: number, receiverId: number): Promise<Message[]> {
    return await MessageRepository.getConversationMessages(userId, receiverId);
  }

  async getAllConversations(userId: number): Promise<any[]> {
    return await MessageRepository.getAllUserConversations(userId);
  }

  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await MessageRepository.getMessage(messageId);
    
    if (!message) {
      throw AppError.notFound('Message');
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw AppError.authorization('You are not authorized to delete this message');
    }

    await MessageRepository.deleteMessage(messageId);

    // Send real-time notification via Socket.IO
    const socketService = getSocketService();
    [message.senderId, message.receiverId].forEach(id => {
      if (id !== userId && socketService.isUserOnline(id)) {
        socketService.sendNotification(id, 'message-deleted', {
          messageId,
          conversationId: message.id
        });
      }
    });

    // Publish to RabbitMQ
    try {
      await messageQueueProducer.publishToQueue(QUEUES.MESSAGE_DELETED, {
        messageId,
        deletedBy: userId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to publish message deletion to queue:', error);
    }
  }

  async getUnreadMessages(userId: number): Promise<Message[]> {
    return await MessageRepository.getUnreadMessages(userId);
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    const message = await MessageRepository.getMessage(messageId);
    
    if (!message) {
      throw AppError.notFound('Message');
    }

    if (message.receiverId !== userId) {
      throw AppError.authorization('You are not authorized to mark this message as read');
    }

    await MessageRepository.markMessageAsRead(messageId);

    // Send real-time notification via Socket.IO
    const socketService = getSocketService();
    if (socketService.isUserOnline(message.senderId)) {
      socketService.sendNotification(message.senderId, 'message-read', {
        messageId,
        readBy: userId
      });
    }

    // Publish to RabbitMQ
    try {
      await messageQueueProducer.publishToQueue(QUEUES.MESSAGE_READ, {
        messageId,
        readBy: userId,
        senderId: message.senderId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to publish message read status to queue:', error);
    }
  }
}

export default new MessageService(); 