import { Request, Response, NextFunction } from 'express';
import MessageService from '../services/MessageService';
import { ApiResponse } from '../utils/response';

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user!.userId;

    const message = await MessageService.sendMessage({
      senderId,
      receiverId,
      content
    });

    res.status(201).json(ApiResponse.created(message, 'Message sent successfully'));
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { receiverId } = req.params;

    const messages = await MessageService.getConversation(
      userId,
      parseInt(receiverId)
    );

    res.json(ApiResponse.success(messages, 'Conversation retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const conversations = await MessageService.getAllConversations(userId);

    res.json(ApiResponse.success(conversations, 'Conversations retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { messageId } = req.params;

    await MessageService.deleteMessage(parseInt(messageId), userId);

    res.json(ApiResponse.noContent('Message deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUnreadMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const messages = await MessageService.getUnreadMessages(userId);

    res.json(ApiResponse.success(messages, 'Unread messages retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const markMessageAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { messageId } = req.params;

    await MessageService.markMessageAsRead(parseInt(messageId), userId);

    res.json(ApiResponse.success(null, 'Message marked as read'));
  } catch (error) {
    next(error);
  }
}; 