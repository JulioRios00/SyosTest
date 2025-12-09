
import amqp from 'amqplib';
import { IMessageQueue, SensorDataMessage } from '../../domain/ports/IMessageQueue';

export class RabbitMQConsumer implements IMessageQueue {
  private connection: any = null;
  private channel: any = null;
  private readonly url: string;

  constructor(url?: string) {
    this.url = url || process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();

      // Declare the queue
      await this.channel.assertQueue('sensor-data', {
        durable: true,
      });

      // Set prefetch to 1 to ensure fair distribution
      this.channel.prefetch(1);

    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }

  async publish(queue: string, message: SensorDataMessage): Promise<void> {
    throw new Error('Publish method not implemented in Consumer');
  }

  async consume(
    queue: string,
    handler: (message: SensorDataMessage) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    try {
      await this.channel.consume(
        queue,
        async (msg: any) => {
          if (msg) {
            try {
              const messageContent = JSON.parse(msg.content.toString());
              await handler(messageContent);
              this.channel!.ack(msg);
            } catch (error) {
              console.error('Error processing message:', error);
              // Reject and requeue the message after 3 attempts
              this.channel!.nack(msg, false, true);
            }
          }
        },
        { noAck: false }
      );

    } catch (error) {
      console.error('Failed to consume messages from RabbitMQ:', error);
      throw error;
    }
  }
}
