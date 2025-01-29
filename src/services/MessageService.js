const MessageRepository = require('../repositories/MessageRepository');

class MessageService {
  async sendMessage(senderId, receiverId, content) {
    if (!content || !senderId || !receiverId) {
      throw new Error('Missing required fields');
    }

    return await MessageRepository.createMessage(senderId, receiverId, content);
  }

  async getConversation(userId, receiverId) {
    if (!userId || !receiverId) {
      throw new Error('Missing required fields');
    }

    return await MessageRepository.getConversation(userId, receiverId);
  }

  async getAllConversations(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await MessageRepository.getAllConversations(userId);
  }

  async deleteMessage(messageId, userId) {
    if (!messageId || !userId) {
      throw new Error('Missing required fields');
    }

    const result = await MessageRepository.deleteMessage(messageId, userId);
    if (!result) {
      throw new Error('Message not found or unauthorized');
    }

    return { success: true };
  }

  async getUnreadMessages(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await MessageRepository.getUnreadMessages(userId);
  }

  async markAsRead(messageId, userId) {
    if (!messageId || !userId) {
      throw new Error('Missing required fields');
    }

    const result = await MessageRepository.markAsRead(messageId, userId);
    if (!result[0]) {
      throw new Error('Message not found or unauthorized');
    }

    return { success: true };
  }
}

module.exports = new MessageService(); 