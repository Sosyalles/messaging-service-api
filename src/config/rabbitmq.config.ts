import amqp, { Channel, Connection } from 'amqplib';

class RabbitMQService {
  private static instance: RabbitMQService;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 5000;

  private constructor() {}

  public static getInstance(): RabbitMQService {
    if (!RabbitMQService.instance) {
      RabbitMQService.instance = new RabbitMQService();
    }
    return RabbitMQService.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        
        this.connection.on('error', (error) => {
          console.error('RabbitMQ connection error:', error);
          this.handleConnectionError();
        });

        this.connection.on('close', () => {
          console.error('RabbitMQ connection closed');
          this.handleConnectionError();
        });

        console.log('Connected to RabbitMQ');
      }

      if (!this.channel) {
        this.channel = await this.connection.createChannel();
        
        this.channel.on('error', (error) => {
          console.error('RabbitMQ channel error:', error);
          this.handleChannelError();
        });

        this.channel.on('close', () => {
          console.error('RabbitMQ channel closed');
          this.handleChannelError();
        });

        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;
        console.log('RabbitMQ channel created');
      }
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.handleConnectionError();
    }
  }

  private async handleConnectionError(): Promise<void> {
    this.connection = null;
    this.channel = null;

    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
      
      setTimeout(async () => {
        await this.connect();
      }, this.RECONNECT_INTERVAL);
    } else {
      console.error('Max reconnection attempts reached. Please check RabbitMQ connection.');
    }
  }

  private async handleChannelError(): Promise<void> {
    this.channel = null;
    if (this.connection && this.connection.connection) {
      try {
        this.channel = await this.connection.createChannel();
        console.log('RabbitMQ channel recreated');
      } catch (error) {
        console.error('Failed to recreate channel:', error);
        this.handleConnectionError();
      }
    }
  }

  public async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect();
    }
    if (!this.channel) {
      throw new Error('Failed to get RabbitMQ channel');
    }
    return this.channel;
  }

  public async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }
}

export const rabbitMQService = RabbitMQService.getInstance(); 