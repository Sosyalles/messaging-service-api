export const mockSocketService = {
  isUserOnline: jest.fn(),
  sendNotification: jest.fn()
};

export const mockMessageService = {
  sendMessage: jest.fn(),
  getConversation: jest.fn(),
  getAllConversations: jest.fn(),
  deleteMessage: jest.fn(),
  getUnreadMessages: jest.fn(),
  markMessageAsRead: jest.fn()
};

export const mockRabbitMQService = {
  publishToQueue: jest.fn(),
  publishMessage: jest.fn()
}; 