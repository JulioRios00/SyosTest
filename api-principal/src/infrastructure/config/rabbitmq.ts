// TODO 5: Infrastructure Layer - RabbitMQ adapter
// RabbitMQ implementation of IMessageQueue port

import amqp, { Channel, Connection } from 'amqplib';
import { IMessageQueue, SensorDataMessage } from '../../domain/ports/IMessageQueue';

export class RabbitMQAdapter implements IMessageQueue {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
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
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      this.channel.sendToQueue(queue, messageBuffer, {
        persistent: true,
      });
    } catch (error) {
      console.error('Failed to publish message to RabbitMQ:', error);
      throw error;
    }
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
        async (msg) => {
          if (msg) {
            try {
              const messageContent = JSON.parse(msg.content.toString());
              await handler(messageContent);
              this.channel!.ack(msg);
            } catch (error) {
              console.error('Error processing message:', error);
              // Reject and requeue the message
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
