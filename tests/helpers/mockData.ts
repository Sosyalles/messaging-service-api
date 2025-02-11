import { Message } from '../../src/types/message';

export const createMockMessage = (overrides = {}): Message => ({
  id: 1,
  senderId: 1,
  receiverId: 2,
  content: 'Test message',
  isRead: false,
  createdAt: new Date(),
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  userId: 1,
  email: 'test@example.com',
  ...overrides
});

export const createMockRequest = (overrides = {}) => ({
  user: createMockUser(),
  body: {},
  params: {},
  ...overrides
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}; 