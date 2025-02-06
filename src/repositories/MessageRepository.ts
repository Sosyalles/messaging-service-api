import { Message } from '../models/Message';
import { SendMessageDTO } from '../types/message';
import { Op } from 'sequelize';

class MessageRepository {
  async createMessage(messageData: SendMessageDTO): Promise<Message> {
    return await Message.create(messageData as any);
  }

  async getMessage(messageId: number): Promise<Message | null> {
    return await Message.findByPk(messageId);
  }

  async getConversationMessages(userId: number, receiverId: number): Promise<Message[]> {
    return await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });
  }

  async getAllUserConversations(userId: number): Promise<any[]> {
    return await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }]
      },
      order: [['createdAt', 'DESC']]
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    await Message.destroy({ where: { id: messageId } });
  }

  async getUnreadMessages(userId: number): Promise<Message[]> {
    return await Message.findAll({
      where: { receiverId: userId, isRead: false },
      order: [['createdAt', 'DESC']]
    });
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await Message.update({ isRead: true }, { where: { id: messageId } });
  }
}

export default new MessageRepository(); 