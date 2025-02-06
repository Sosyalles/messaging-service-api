import swaggerJsdoc from 'swagger-jsdoc';
import { join } from 'path';

const options: swaggerJsdoc.Options = {
  failOnErrors: true, // Throw errors if Swagger validation fails
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Messaging Service API',
      version: '1.0.0',
      description: 'Real-time messaging service with Socket.IO and RabbitMQ integration',
      contact: {
        name: 'API Support',
        email: 'support@messaging-service.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Message: {
          type: 'object',
          required: ['id', 'senderId', 'receiverId', 'content'],
          properties: {
            id: {
              type: 'integer',
              description: 'Message unique identifier'
            },
            senderId: {
              type: 'integer',
              description: 'ID of the message sender'
            },
            receiverId: {
              type: 'integer',
              description: 'ID of the message receiver'
            },
            content: {
              type: 'string',
              description: 'Message content'
            },
            isRead: {
              type: 'boolean',
              description: 'Message read status',
              default: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Message creation timestamp'
            }
          }
        },
        SendMessageRequest: {
          type: 'object',
          required: ['receiverId', 'content'],
          properties: {
            receiverId: {
              type: 'integer',
              description: 'ID of the message receiver'
            },
            content: {
              type: 'string',
              description: 'Message content',
              minLength: 1,
              maxLength: 1000
            }
          }
        },
        Error: {
          type: 'object',
          required: ['success', 'message', 'statusCode'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the operation was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [{
      BearerAuth: []
    }]
  },
  apis: [
    join(__dirname, '../routes/*.ts'),
    join(__dirname, '../routes/*.js')
  ]
};

export const swaggerSpec = swaggerJsdoc(options); 