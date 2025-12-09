

import dotenv from 'dotenv';
import { DatabaseConnection } from './infrastructure/config/database';
import { TinyboneSensorRepository } from './infrastructure/database/TinyboneSensorRepository';
import { RabbitMQProducer } from './infrastructure/rabbitmq/RabbitMQProducer';
import { WinstonLogger } from './infrastructure/config/logger';
import { CollectSensorDataUseCase } from './application/use-cases/CollectSensorDataUseCase';

dotenv.config();

// IIFE (Immediately Invoked Function Expression) Pattern
(async function SensorService() {
  const logger = new WinstonLogger('sensor-service');
  const collectionInterval = parseInt(process.env.COLLECTION_INTERVAL || '10000'); // 10 seconds default
  
  let intervalId: NodeJS.Timeout | null = null;
  let messageQueue: RabbitMQProducer | null = null;

  async function initialize(): Promise<void> {
    try {
      logger.info('Starting Sensor Service...');

      // Initialize database connection
      await DatabaseConnection.initialize();
      logger.info('Database connected');

      // Initialize RabbitMQ
      messageQueue = new RabbitMQProducer();
      await messageQueue.connect();
      logger.info('RabbitMQ connected');

      // Setup dependency injection
      const sensorRepository = new TinyboneSensorRepository();
      const collectSensorDataUseCase = new CollectSensorDataUseCase(
        sensorRepository,
        messageQueue,
        logger
      );

      // Start periodic data collection
      logger.info(`Starting data collection every ${collectionInterval}ms`);
      
      // Collect immediately on startup
      await collectSensorDataUseCase.execute();

      // Then collect periodically
      intervalId = setInterval(async () => {
        try {
          await collectSensorDataUseCase.execute();
        } catch (error) {
          logger.error('Error during data collection cycle', error as Error);
        }
      }, collectionInterval);

      logger.info('Sensor Service started successfully');
    } catch (error) {
      logger.error('Failed to initialize Sensor Service', error as Error);
      await shutdown();
      process.exit(1);
    }
  }

  async function shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Sensor Service...');

      if (intervalId) {
        clearInterval(intervalId);
      }

      if (messageQueue) {
        await messageQueue.disconnect();
      }

      await DatabaseConnection.close();

      logger.info('Sensor Service stopped');
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
