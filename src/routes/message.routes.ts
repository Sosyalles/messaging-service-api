import { Router } from 'express';
import { celebrate } from 'celebrate';
import { messageValidation } from '../validations';
import { authMiddleware } from '../middlewares/auth';
import { apiLimiter, messageLimiter } from '../middlewares/rateLimiter';
import { validateRequestParams } from '../validations/common';
import { 
  sendMessage,
  getConversation,
  getAllConversations,
  deleteMessage,
  getUnreadMessages,
  markMessageAsRead
} from '../controllers/MessageController';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Messages
 *   description: Message management endpoints
 */

// Apply rate limiting to all routes
router.use(apiLimiter);

/**
 * @openapi
 * /api/messages/send:
 *   post:
 *     tags: [Messages]
 *     summary: Send a new message
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent successfully
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/send',
  authMiddleware,
  messageLimiter, // Stricter rate limiting for message sending
  celebrate(messageValidation.sendMessage),
  (req, res, next) => {
    try {
      // Validate and sanitize request parameters
      req.body = validateRequestParams(req.body);
      next();
    } catch (error) {
      next(error);
    }
  },
  sendMessage
);

/**
 * @openapi
 * /api/messages/conversation/{receiverId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get conversation messages with a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get conversation with
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/conversation/:receiverId',
  authMiddleware,
  celebrate(messageValidation.getConversation),
  (req, res, next) => {
    try {
      req.params = validateRequestParams(req.params);
      next();
    } catch (error) {
      next(error);
    }
  },
  getConversation
);

/**
 * @openapi
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get all conversations for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                       lastMessage:
 *                         $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/conversations',
  authMiddleware,
  getAllConversations
);

/**
 * @openapi
 * /api/messages/{messageId}:
 *   delete:
 *     tags: [Messages]
 *     summary: Delete a message
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this message
 *       404:
 *         description: Message not found
 */
router.delete(
  '/:messageId',
  authMiddleware,
  celebrate(messageValidation.deleteMessage),
  (req, res, next) => {
    try {
      req.params = validateRequestParams(req.params);
      next();
    } catch (error) {
      next(error);
    }
  },
  deleteMessage
);

/**
 * @openapi
 * /api/messages/unread:
 *   get:
 *     tags: [Messages]
 *     summary: Get all unread messages for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/unread',
  authMiddleware,
  getUnreadMessages
);

/**
 * @openapi
 * /api/messages/{messageId}/read:
 *   patch:
 *     tags: [Messages]
 *     summary: Mark a message as read
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to mark this message as read
 *       404:
 *         description: Message not found
 */
router.patch(
  '/:messageId/read',
  authMiddleware,
  celebrate(messageValidation.markMessageAsRead),
  (req, res, next) => {
    try {
      req.params = validateRequestParams(req.params);
      next();
    } catch (error) {
      next(error);
    }
  },
  markMessageAsRead
);

export default router; 