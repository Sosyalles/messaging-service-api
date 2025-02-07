#!/bin/bash

# RabbitMQ Service and Message Queue Components
git add src/services/RabbitMQService.ts
git commit -m "feat(rabbitmq): Implement RabbitMQ service
- Add singleton RabbitMQ service class
- Implement connection management and error handling
- Add channel creation and management
- Configure automatic reconnection logic"

git add src/utils/rabbitmqProducer.ts
git commit -m "feat(rabbitmq): Add message producer utility
- Implement singleton message producer
- Add methods for publishing to exchanges and queues
- Add error handling and channel management
- Implement message buffering and persistence"

git add src/utils/rabbitmqConsumer.ts
git commit -m "feat(rabbitmq): Add message consumer utility
- Implement singleton message consumer
- Add queue and exchange consumption handlers
- Implement message acknowledgment logic
- Add error handling and retry mechanisms"

# Message Service Components
git add src/services/MessageService.ts
git commit -m "feat(message): Implement message service
- Add core message handling logic
- Integrate with RabbitMQ for async processing
- Add real-time notifications via Socket.IO
- Implement message status tracking"

git add src/controllers/MessageController.ts
git commit -m "feat(api): Add message controller
- Implement REST endpoints for message operations
- Add input validation and error handling
- Integrate with message service
- Add response formatting"

# Database and Models
git add src/models/Message.ts src/models/Conversation.ts
git commit -m "feat(db): Add database models
- Create Message and Conversation models
- Add model relationships and constraints
- Implement timestamps and soft deletes
- Add model validation rules"

# Configuration Files
git add src/config/env.config.ts
git commit -m "feat(config): Add environment configuration
- Add environment variable validation
- Configure development and production settings
- Add service URLs and credentials
- Implement configuration type safety"

# Socket Configuration
git add src/config/socket.config.ts
git commit -m "feat(socket): Add Socket.IO configuration
- Implement real-time message delivery
- Add connection management
- Implement authentication middleware
- Add event handlers for messaging"

# API Documentation
git add src/config/swagger.config.ts
git commit -m "feat(docs): Add API documentation
- Configure Swagger/OpenAPI documentation
- Add endpoint specifications
- Document request/response schemas
- Add authentication documentation"

# Docker Configuration
git add Dockerfile docker-compose.yml
git commit -m "feat(docker): Add containerization
- Create multi-stage Dockerfile
- Configure service dependencies
- Add volume management
- Configure development and production environments"

# Type Definitions
git add src/types/*.ts
git commit -m "feat(types): Add TypeScript definitions
- Add message and user types
- Create DTOs for API requests/responses
- Add service interfaces
- Implement type safety across the application"

# Middleware
git add src/middlewares/*.ts
git commit -m "feat(middleware): Add API middlewares
- Implement authentication middleware
- Add error handling middleware
- Add request validation
- Implement logging middleware"

# Final Project Structure
git add .
git commit -m "chore: Finalize project structure
- Organize project directories
- Update README documentation
- Add example environment files
- Configure development scripts" 