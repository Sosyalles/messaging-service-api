export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface SendMessageDTO {
  senderId: number;
  receiverId: number;
  content: string;
}

export interface ConversationDTO {
  id: number;
  userOneId: number;
  userTwoId: number;
  lastMessageId?: number;
  lastMessage?: Message;
  updatedAt: Date;
}

export interface MessageQueuePayload {
  messageId: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

export interface MessageDeletedPayload {
  messageId: number;
  deletedBy: number;
  senderId: number;
  receiverId: number;
  timestamp: Date;
}

export interface MessageReadPayload {
  messageId: number;
  readBy: number;
  senderId: number;
  timestamp: Date;
} 