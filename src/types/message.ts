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