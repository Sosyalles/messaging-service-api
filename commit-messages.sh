#!/bin/bash

# Initial setup and project structure
git add .
git commit -m "feat: Initial project setup with TypeScript and Express
- Configure TypeScript and Express.js
- Set up project directory structure
- Add basic dependencies
- Create initial README.md"

# Database and models
git add src/models/*
git commit -m "feat(models): Implement database models and schemas
- Add Message model with Sequelize
- Add Log model for application logging
- Add Conversation model for chat management
- Configure database relationships and indices"

# Core messaging functionality
git add src/controllers/MessageController.ts src/services/MessageService.ts src/repositories/MessageRepository.ts
git commit -m "feat(messaging): Implement core messaging functionality
- Add message sending and receiving
- Implement conversation management
- Add message read status tracking
- Set up message deletion functionality"

# Authentication and middleware
git add src/middlewares/*
git commit -m "feat(auth): Add authentication and middleware
- Implement JWT authentication middleware
- Add error handling middleware
- Set up request validation
- Configure security headers"

# WebSocket integration
git add src/config/socket.config.ts
git commit -m "feat(websocket): Integrate Socket.IO for real-time messaging
- Set up WebSocket server configuration
- Implement real-time message delivery
- Add typing indicators
- Configure connection handling and security"

# Message queue integration
git add src/config/rabbitmq.config.ts src/utils/rabbitmqProducer.ts src/utils/rabbitmqConsumer.ts
git commit -m "feat(queue): Integrate RabbitMQ for message queuing
- Set up RabbitMQ configuration
- Implement message producer
- Add message consumer
- Configure queue error handling and retries"

# API Documentation
git add src/config/swagger.config.ts src/routes/message.routes.ts
git commit -m "feat(docs): Add Swagger documentation
- Configure Swagger UI
- Add API endpoint documentation
- Set up JSON schema definitions
- Include authentication documentation"

# Validation and error handling
git add src/validations/* src/utils/errors.ts src/utils/response.ts
git commit -m "feat(validation): Implement request validation and error handling
- Add input validation schemas
- Implement custom error classes
- Set up standardized API responses
- Add validation middleware"

# Logging system
git add src/utils/logger.ts
git commit -m "feat(logging): Implement comprehensive logging system
- Add Winston logger configuration
- Set up database logging
- Configure log rotation
- Add request/response logging"

# Docker configuration
git add Dockerfile docker-compose.yml
git commit -m "feat(docker): Add Docker configuration
- Create multi-stage Dockerfile
- Set up docker-compose with services
- Configure development and production environments
- Add volume management for persistence"

# Environment and configuration
git add src/config/env.config.ts .env.example
git commit -m "feat(config): Add environment configuration
- Set up environment variable management
- Add configuration validation
- Create example environment file
- Configure different environments"

# Testing setup
git add jest.config.js src/__tests__
git commit -m "feat(test): Set up testing infrastructure
- Configure Jest for TypeScript
- Add test utilities and helpers
- Set up test database configuration
- Add initial test cases"

# Security enhancements
git add .
git commit -m "feat(security): Implement security measures
- Add rate limiting
- Configure CORS policies
- Implement request sanitization
- Add security headers"

# Final touches and documentation
git add README.md CONTRIBUTING.md
git commit -m "docs: Update documentation and add contributing guidelines
- Update main README with setup instructions
- Add API documentation
- Include contribution guidelines
- Add license information" 