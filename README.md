# Messaging Service API

A real-time messaging service API built with Node.js, Express.js, Socket.IO, and PostgreSQL.

## Features

- Real-time messaging using Socket.IO
- RESTful API endpoints for message management
- JWT-based authentication
- PostgreSQL database with Sequelize ORM
- Input validation using Joi
- Error handling middleware

## API Endpoints

### Messages

- `POST /api/messages/send` - Send a message
- `GET /api/messages/conversation/:receiverId` - Get conversation with a specific user
- `GET /api/messages/conversations` - Get all conversations
- `DELETE /api/messages/:messageId` - Delete a message
- `GET /api/messages/unread` - Get unread messages
- `PATCH /api/messages/:messageId/read` - Mark a message as read

## Socket.IO Events

### Client Events
- `message:send` - Send a new message
- `message:read` - Mark a message as read

### Server Events
- `message:sent` - Confirmation of sent message
- `message:received` - New message received
- `message:read` - Message marked as read
- `error` - Error event

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the root directory and add the following variables:
\`\`\`
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=messaging_service
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Cors Configuration
CORS_ORIGIN=http://localhost:3000
\`\`\`

4. Create the database:
\`\`\`bash
createdb messaging_service
\`\`\`

5. Start the server:
\`\`\`bash
npm run dev
\`\`\`

## Usage

### Authentication

Include the JWT token in the Authorization header for all API requests:
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

### Socket.IO Authentication

Include the token in the auth object when connecting to Socket.IO:
\`\`\`javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
\`\`\`

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:
\`\`\`json
{
  "error": "Error type",
  "message": "Error message",
  "details": ["Additional error details"] // Optional
}
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 