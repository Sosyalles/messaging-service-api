const jwt = require('jsonwebtoken');
const MessageService = require('../services/MessageService');

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

const socketHandler = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Join a personal room for receiving messages
    socket.join(`user_${socket.user.id}`);

    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content } = data;
        const message = await MessageService.sendMessage(socket.user.id, receiverId, content);

        // Emit to sender
        socket.emit('message:sent', message);

        // Emit to receiver
        io.to(`user_${receiverId}`).emit('message:received', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('message:read', async (data) => {
      try {
        const { messageId } = data;
        await MessageService.markAsRead(messageId, socket.user.id);

        // Emit to sender of the original message
        const message = await MessageService.getMessage(messageId);
        if (message) {
          io.to(`user_${message.sender_id}`).emit('message:read', { messageId });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });
};

module.exports = socketHandler; 