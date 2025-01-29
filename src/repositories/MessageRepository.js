const { Op } = require('sequelize');
const Message = require('../models/Message');

class MessageRepository {
  async createMessage(senderId, receiverId, content) {
    return await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    });
  }

  async getConversation(userId, receiverId) {
    return await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: userId },
        ],
      },
      order: [['created_at', 'ASC']],
    });
  }

  async getAllConversations(userId) {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
      order: [['created_at', 'DESC']],
    });

    const conversations = new Map();
    messages.forEach((message) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, message);
      }
    });

    return Array.from(conversations.values());
  }

  async deleteMessage(messageId, userId) {
    return await Message.destroy({
      where: {
        id: messageId,
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
    });
  }

  async getUnreadMessages(userId) {
    return await Message.findAll({
      where: {
        receiver_id: userId,
        is_read: false,
      },
      order: [['created_at', 'DESC']],
    });
  }

  async markAsRead(messageId, userId) {
    return await Message.update(
      { is_read: true },
      {
        where: {
          id: messageId,
          receiver_id: userId,
        },
      }
    );
  }
}

module.exports = new MessageRepository(); 