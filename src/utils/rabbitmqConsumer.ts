import { Channel, ConsumeMessage } from 'amqplib';
import { rabbitMQService } from '../services/RabbitMQService';

export class MessageQueueConsumer {
  private static instance: MessageQueueConsumer;
  private channel: Channel | null = null;
  private consumers: Map<string, (message: any) => Promise<void>> = new Map();

  private constructor() {}

  public static getInstance(): MessageQueueConsumer {
    if (!MessageQueueConsumer.instance) {
      MessageQueueConsumer.instance = new MessageQueueConsumer();
    }
    return MessageQueueConsumer.instance;
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      this.channel = await rabbitMQService.getChannel();
    }
    if (!this.channel) {
      throw new Error('Failed to create RabbitMQ channel');
    }
    return this.channel;
  }

  public async consumeFromQueue(
    queueName: string,
    handler: (message: any) => Promise<void>,
    options: any = {}
  ): Promise<void> {
    try {
      const channel = await this.getChannel();
      
      // Ensure queue exists
      await channel.assertQueue(queueName, { durable: true });

      // Store the handler
      this.consumers.set(queueName, handler);

      // Set prefetch count for better load balancing
      await channel.prefetch(1);

      // Start consuming
      await channel.consume(
        queueName,
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              // Parse message content
              const content = JSON.parse(msg.content.toString());
              
              // Process message
              await handler(content);
              
              // Acknowledge message
              channel.ack(msg);
              
              console.log(`Message processed from queue ${queueName}`);
            } catch (error) {
              console.error(`Error processing message from queue ${queueName}:`, error);
              
              // Reject message and requeue if it's not a parsing error
              if (error instanceof SyntaxError) {
                channel.reject(msg, false); // Don't requeue if it's an invalid message
              } else {
                channel.reject(msg, true); // Requeue for retry
              }
            }
          }
        },
        {
          noAck: false,
          ...options
        }
      );

      console.log(`Started consuming from queue ${queueName}`);
    } catch (error) {
      console.error('Error setting up consumer:', error);
      this.channel = null; // Reset channel on error
      throw error;
    }
  }

  public async consumeFromExchange(
    exchange: string,
    routingKey: string,
    handler: (message: any) => Promise<void>,
    options: any = {}
  ): Promise<void> {
    try {
      const channel = await this.getChannel();
      
      // Ensure exchange exists
      await channel.assertExchange(exchange, 'direct', { durable: true });
      
      // Create an exclusive queue for this consumer
      const { queue } = await channel.assertQueue('', { exclusive: true });
      
      // Bind the queue to the exchange with the routing key
      await channel.bindQueue(queue, exchange, routingKey);

      // Store the handler
      this.consumers.set(`${exchange}:${routingKey}`, handler);

      // Set prefetch count
      await channel.prefetch(1);

      // Start consuming
      await channel.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            try {
              // Parse message content
              const content = JSON.parse(msg.content.toString());
              
              // Process message
              await handler(content);
              
              // Acknowledge message
              channel.ack(msg);
              
              console.log(`Message processed from exchange ${exchange} with routing key ${routingKey}`);
            } catch (error) {
              console.error(`Error processing message from exchange ${exchange}:`, error);
              
              // Handle message rejection
              if (error instanceof SyntaxError) {
                channel.reject(msg, false);
              } else {
                channel.reject(msg, true);
              }
            }
          }
        },
        {
          noAck: false,
          ...options
        }
      );

      console.log(`Started consuming from exchange ${exchange} with routing key ${routingKey}`);
    } catch (error) {
      console.error('Error setting up exchange consumer:', error);
      this.channel = null;
      throw error;
    }
  }

  public async cancelConsumer(queueName: string): Promise<void> {
    try {
      const channel = await this.getChannel();
      await channel.cancel(queueName);
      this.consumers.delete(queueName);
      console.log(`Cancelled consumer for queue ${queueName}`);
    } catch (error) {
      console.error(`Error cancelling consumer for queue ${queueName}:`, error);
      throw error;
    }
  }
}

export const messageQueueConsumer = MessageQueueConsumer.getInstance(); 