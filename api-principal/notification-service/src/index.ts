import dotenv from 'dotenv';
import { DatabaseConnection } from './infrastructure/config/database';
import { TinyboneSensorRepository } from './infrastructure/database/TinyboneSensorRepository';
import { TinyboneAlertRepository } from './infrastructure/database/TinyboneAlertRepository';
import { RabbitMQConsumer } from './infrastructure/rabbitmq/RabbitMQConsumer';
import { WinstonLogger } from './infrastructure/config/logger';
import { ProcessAlertUseCase } from './application/use-cases/ProcessAlertUseCase';

dotenv.config();

(async function NotificationService() {
  const logger = new WinstonLogger('notification-service');
  let messageQueue: RabbitMQConsumer | null = null;

  async function initialize(): Promise<void> {
    try {
      logger.info('Starting Notification Service...');

      await DatabaseConnection.initialize();
      logger.info('Database connected');

      messageQueue = new RabbitMQConsumer();
      await messageQueue.connect();
      logger.info('RabbitMQ connected');

      const sensorRepository = new TinyboneSensorRepository();
      const alertRepository = new TinyboneAlertRepository();
      const processAlertUseCase = new ProcessAlertUseCase(
        sensorRepository,
        alertRepository,
        logger
      );

      await messageQueue.consume('sensor-data', async (message) => {
        await processAlertUseCase.execute(message);
      });

      logger.info('Notification Service started successfully');
      logger.info('Waiting for sensor data messages...');
    } catch (error) {
      logger.error('Failed to initialize Notification Service', error as Error);
      await shutdown();
      process.exit(1);
    }
  }

  async function shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Notification Service...');

      if (messageQueue) {
        await messageQueue.disconnect();
      }

      await DatabaseConnection.close();

      logger.info('Notification Service stopped');
    } catch (error) {
      logger.error('Error during shutdown', error as Error);
    }
  }

  // Graceful shutdown handlers
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    await shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received');
    await shutdown();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught exception', error);
    await shutdown();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    logger.error('Unhandled rejection', reason as Error, { promise });
    await shutdown();
    process.exit(1);
  });

  // Start the service
  await initialize();
})();
