const express = require('express');
const MessageController = require('../controllers/MessageController');
const { authenticate } = require('../middlewares/auth');
const { validateMessage } = require('../middlewares/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Message routes
router.post('/send', validateMessage, MessageController.sendMessage);
router.get('/conversation/:receiverId', MessageController.getConversation);
router.get('/conversations', MessageController.getAllConversations);
router.delete('/:messageId', MessageController.deleteMessage);
router.get('/unread', MessageController.getUnreadMessages);
router.patch('/:messageId/read', MessageController.markAsRead);

module.exports = router; 