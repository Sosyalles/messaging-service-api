export type SocketEventType = 'private-message' | 'typing-status' | 'notification' | 'user-status';

export interface SocketMessage {
  receiverId: number;
  content: string;
  type?: string;
  isTyping?: boolean;
  timestamp?: number;
}

export interface SocketUser {
  socketId: string;
  lastActivity: number;
  connectionCount: number;
  rateLimitTokens: number;
  lastTokenRefill: number;
}

export interface SocketNotification {
  type: string;
  data: any;
  timestamp: number;
}

export interface SocketUserStatus {
  userId: number;
  isOnline: boolean;
  timestamp: number;
}

export interface SocketMessageSignature {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: number;
  signature: string;
} 