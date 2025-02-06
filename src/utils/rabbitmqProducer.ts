import { Channel } from 'amqplib';
import { rabbitMQService } from '../config/rabbitmq.config';

export class MessageQueueProducer {
  private static instance: MessageQueueProducer;
  private channel: Channel | null = null;

  private constructor() {}

  public static getInstance(): MessageQueueProducer {
    if (!MessageQueueProducer.instance) {
      MessageQueueProducer.instance = new MessageQueueProducer();
    }
    return MessageQueueProducer.instance;
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = await rabbitMQService.getChannel();
    }
    return this.channel;
  }

  public async publishMessage(
    exchange: string,
    routingKey: string,
    message: any,
    options: any = {}
  ): Promise<void> {
    try {
      const channel = await this.getChannel();
      
      // Ensure exchange exists
      await channel.assertExchange(exchange, 'direct', { durable: true });
      
      // Convert message to buffer
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      // Publish with default options merged with provided options
      const publishOptions = {
        persistent: true,
        ...options
      };

      const published = channel.publish(
        exchange,
        routingKey,
        messageBuffer,
        publishOptions
      );

      if (!published) {
        throw new Error('Message was not published to RabbitMQ');
      }

      console.log(`Message published to exchange ${exchange} with routing key ${routingKey}`);
    } catch (error) {
      console.error('Error publishing message:', error);
      this.channel = null; // Reset channel on error
      throw error;
    }
  }

  public async publishToQueue(
    queueName: string,
    message: any,
    options: any = {}
  ): Promise<void> {
    try {
      const channel = await this.getChannel();
      
      // Ensure queue exists
      await channel.assertQueue(queueName, { durable: true });
      
      // Convert message to buffer
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      // Publish with default options merged with provided options
      const publishOptions = {
        persistent: true,
        ...options
      };

      const sent = channel.sendToQueue(
        queueName,
        messageBuffer,
        publishOptions
      );

      if (!sent) {
        throw new Error('Message was not sent to queue');
      }

      console.log(`Message sent to queue ${queueName}`);
    } catch (error) {
      console.error('Error sending message to queue:', error);
      this.channel = null; // Reset channel on error
      throw error;
    }
  }
}

export const messageQueueProducer = MessageQueueProducer.getInstance(); 