const MessageService = require('../services/MessageService');

class MessageController {
  async sendMessage(req, res, next) {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id; // From JWT auth middleware

      const message = await MessageService.sendMessage(senderId, receiverId, content);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { receiverId } = req.params;
      const userId = req.user.id;

      const messages = await MessageService.getConversation(userId, parseInt(receiverId));
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async getAllConversations(req, res, next) {
    try {
      const userId = req.user.id;

      const conversations = await MessageService.getAllConversations(userId);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      await MessageService.deleteMessage(parseInt(messageId), userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getUnreadMessages(req, res, next) {
    try {
      const userId = req.user.id;

      const messages = await MessageService.getUnreadMessages(userId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      await MessageService.markAsRead(parseInt(messageId), userId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController(); 