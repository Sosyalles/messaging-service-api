import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { configureSocket } from './config/socket.config';
import messageRoutes from './routes/message.routes';
import healthRoutes from './routes/health.routes';
import swaggerRoutes from './routes/swagger.routes';
import { errorHandler } from './middlewares/error';
import { authMiddleware } from './middlewares/auth';
import { bodySizeLimit } from './middlewares/requestLimiter';
import { rabbitMQService } from './services/RabbitMQService';
import { env } from './config/env.config';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Initialize Socket.IO
configureSocket(io);

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false  // This is needed for Swagger UI to work properly
}));
app.use(bodySizeLimit);
app.use(express.json());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api-docs', swaggerRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);

// Error handling
app.use(errorHandler);

// Start the server and initialize RabbitMQ
const startServer = async () => {
  try {
    await rabbitMQService.initialize();
    
    httpServer.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
      console.log(`API Documentation available at http://localhost:${env.PORT}/api-docs`);
      console.log(`Swagger JSON available at http://localhost:${env.PORT}/api-docs/json`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Starting graceful shutdown...');
  
  try {
    // Close RabbitMQ connection
    await rabbitMQService.closeConnection();
    
    // Close HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer(); 