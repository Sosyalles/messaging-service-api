import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { configureSocket } from './config/socket.config';
import { swaggerSpec } from './config/swagger.config';
import messageRoutes from './routes/message.routes';
import { errorHandler } from './middlewares/error';
import { authMiddleware } from './middlewares/auth';
import { rabbitMQService } from './config/rabbitmq.config';
import { messageQueueConsumer } from './utils/rabbitmqConsumer';

// Load environment variables based on NODE_ENV
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Initialize Socket.IO
configureSocket(io);

// Initialize RabbitMQ
const initializeRabbitMQ = async () => {
  try {
    await rabbitMQService.connect();
    
    // Set up message consumers
    await messageQueueConsumer.consumeFromQueue('new_message', async (message) => {
      console.log('New message received:', message);
      // Handle new message event
    });

    await messageQueueConsumer.consumeFromQueue('message_deleted', async (message) => {
      console.log('Message deleted:', message);
      // Handle message deletion event
    });

    await messageQueueConsumer.consumeFromQueue('message_read', async (message) => {
      console.log('Message read:', message);
      // Handle message read event
    });

    console.log('RabbitMQ consumers initialized');
  } catch (error) {
    console.error('Failed to initialize RabbitMQ:', error);
    process.exit(1);
  }
};

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false  // This is needed for Swagger UI to work properly
}));
app.use(express.json());

// Swagger Documentation
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Messaging Service API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    url: '/api-docs.json'
  }
}));

// Routes
app.use('/api/messages', authMiddleware, messageRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start the server and initialize RabbitMQ
const startServer = async () => {
  try {
    await initializeRabbitMQ();
    
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`Swagger JSON available at http://localhost:${PORT}/api-docs.json`);
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