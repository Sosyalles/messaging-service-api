import { Server, Socket } from 'socket.io';
import axios, { isAxiosError } from 'axios';
import { AuthVerifyResponse } from '../types/userService';
import { createHash } from 'crypto';

// Event types for better type safety and performance
type SocketEventType = 'private-message' | 'typing-status' | 'notification' | 'user-status';

interface SocketMessage {
  receiverId: number;
  content: string;
  type?: string;
  isTyping?: boolean;
  timestamp?: number;
}

interface SocketUser {
  socketId: string;
  lastActivity: number;
  connectionCount: number;
  rateLimitTokens: number;
  lastTokenRefill: number;
}

class SocketService {
  private io: Server;
  private readonly onlineUsers = new Map<number, SocketUser>();
  private readonly INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CONNECTIONS_PER_USER = 5;
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_TOKENS = 50;
  private readonly TOKEN_REFILL_RATE = 10; // Tokens per minute
  private readonly blockedTokens = new Set<string>();

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
    this.startInactivityCheck();
    this.startTokenRefill();
  }

  private async setupMiddleware(): Promise<void> {
    this.io.use(async (socket, next) => {
      try {
        // Rate limiting check
        if (!this.checkRateLimit(socket)) {
          throw new Error('Rate limit exceeded');
        }

        const token = socket.handshake.auth.token;
        if (!token) throw new Error('Authentication token required');

        // Check for blocked tokens
        const tokenHash = this.hashToken(token);
        if (this.blockedTokens.has(tokenHash)) {
          throw new Error('Token is blocked');
        }

        const response = await axios.get<AuthVerifyResponse>(
          `${process.env.USER_SERVICE_URL}/auth/verify`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'X-Client-IP': socket.handshake.address,
              'X-Request-ID': socket.id
            },
            timeout: 5000
          }
        );

        if (!response.data?.data?.id) {
          throw new Error('Invalid user data received');
        }

        const userId = response.data.data.id;

        // Check connection limit
        const user = this.onlineUsers.get(userId);
        if (user && user.connectionCount >= this.MAX_CONNECTIONS_PER_USER) {
          throw new Error('Maximum connection limit reached');
        }

        socket.data.userId = userId;
        socket.data.tokenHash = tokenHash;

        // Set security headers
        socket.emit('connection-secure', {
          timestamp: Date.now(),
          sessionId: socket.id
        });

        next();
      } catch (error) {
        if (isAxiosError(error)) {
          if (error.response?.status === 401) {
            this.blockToken(socket.data.tokenHash);
            return next(new Error('Invalid or expired token'));
          }
          if (error.response?.status === 403) return next(new Error('Access denied'));
        }
        next(error instanceof Error ? error : new Error('Authentication failed'));
      }
    });
  }

  private checkRateLimit(socket: Socket): boolean {
    const userId = socket.data.userId;
    const user = this.onlineUsers.get(userId);
    
    if (!user) return true;

    if (user.rateLimitTokens <= 0) {
      return false;
    }

    user.rateLimitTokens--;
    return true;
  }

  private startTokenRefill(): void {
    setInterval(() => {
      for (const user of this.onlineUsers.values()) {
        const now = Date.now();
        const timePassed = now - user.lastTokenRefill;
        const tokensToAdd = Math.floor(timePassed / (60 * 1000)) * this.TOKEN_REFILL_RATE;

        if (tokensToAdd > 0) {
          user.rateLimitTokens = Math.min(
            user.rateLimitTokens + tokensToAdd,
            this.RATE_LIMIT_MAX_TOKENS
          );
          user.lastTokenRefill = now;
        }
      }
    }, 60 * 1000); // Check every minute
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private blockToken(tokenHash: string): void {
    this.blockedTokens.add(tokenHash);
    // Clean up old blocked tokens after 24 hours
    setTimeout(() => {
      this.blockedTokens.delete(tokenHash);
    }, 24 * 60 * 60 * 1000);
  }

  private setupEventHandlers(): void {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket): void {
    const userId = socket.data.userId;
    this.addOnlineUser(userId, socket.id);

    const messageEvents: SocketEventType[] = ['private-message', 'typing-status', 'notification'];
    messageEvents.forEach(event => {
      socket.on(event, (data: SocketMessage) => {
        // Validate message data
        if (!this.validateMessageData(data)) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }
        this.handleMessage(event, userId, data);
      });
    });

    socket.on('disconnect', () => this.handleDisconnect(userId, socket.id));
    socket.on('error', this.handleError.bind(this));
  }

  private validateMessageData(data: SocketMessage): boolean {
    if (!data || typeof data !== 'object') return false;
    if (!Number.isInteger(data.receiverId) || data.receiverId <= 0) return false;
    if (typeof data.content !== 'string' || data.content.length > 5000) return false;
    if (data.type && typeof data.type !== 'string') return false;
    if (data.isTyping !== undefined && typeof data.isTyping !== 'boolean') return false;
    return true;
  }

  private handleMessage(event: SocketEventType, senderId: number, data: SocketMessage): void {
    const { receiverId, content, isTyping } = data;
    const receiver = this.onlineUsers.get(receiverId);
    
    if (receiver) {
      // Add message signature for integrity
      const signature = this.createMessageSignature(senderId, receiverId, content);
      
      this.io.to(receiver.socketId).emit(event, {
        senderId,
        content,
        timestamp: Date.now(),
        signature,
        ...(isTyping !== undefined && { isTyping })
      });
      this.updateUserActivity(receiverId);
    }
  }

  private createMessageSignature(senderId: number, receiverId: number, content: string): string {
    const data = `${senderId}:${receiverId}:${content}:${process.env.MESSAGE_SIGNATURE_SECRET}`;
    return createHash('sha256').update(data).digest('hex');
  }

  private handleDisconnect(userId: number, socketId: string): void {
    this.removeOnlineUser(userId);
  }

  private handleError(error: Error): void {
    console.error('Socket error:', error.message);
  }

  public isUserOnline(userId: number): boolean {
    const user = this.onlineUsers.get(userId);
    return !!user && (Date.now() - user.lastActivity) < this.INACTIVE_TIMEOUT;
  }

  public sendNotification(userId: number, type: string, data: any): void {
    const user = this.onlineUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit('notification', { 
        type, 
        data,
        timestamp: Date.now()
      });
      this.updateUserActivity(userId);
    }
  }

  private addOnlineUser(userId: number, socketId: string): void {
    this.onlineUsers.set(userId, {
      socketId,
      lastActivity: Date.now(),
      connectionCount: 1,
      rateLimitTokens: this.RATE_LIMIT_MAX_TOKENS,
      lastTokenRefill: Date.now()
    });
    this.broadcastUserStatus(userId, true);
  }

  private removeOnlineUser(userId: number): void {
    this.onlineUsers.delete(userId);
    this.broadcastUserStatus(userId, false);
  }

  private updateUserActivity(userId: number): void {
    const user = this.onlineUsers.get(userId);
    if (user) {
      user.lastActivity = Date.now();
    }
  }

  private broadcastUserStatus(userId: number, isOnline: boolean): void {
    this.io.emit('user-status', { 
      userId, 
      isOnline,
      timestamp: Date.now()
    });
  }

  private startInactivityCheck(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [userId, user] of this.onlineUsers.entries()) {
        if (now - user.lastActivity >= this.INACTIVE_TIMEOUT) {
          this.removeOnlineUser(userId);
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }
}

let socketService: SocketService;

export const configureSocket = (io: Server): void => {
  socketService = new SocketService(io);
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized');
  }
  return socketService;
}; 