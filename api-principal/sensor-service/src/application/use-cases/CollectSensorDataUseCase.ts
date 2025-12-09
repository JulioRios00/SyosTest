
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { IMessageQueue, SensorDataMessage } from '../../domain/ports/IMessageQueue';
import { ILogger } from '../../domain/ports/ILogger';
import { Temperature } from '../../domain/value-objects/Temperature';
import { Humidity } from '../../domain/value-objects/Humidity';

export class CollectSensorDataUseCase {
  constructor(
    private readonly sensorRepository: ISensorRepository,
    private readonly messageQueue: IMessageQueue,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<void> {
    try {
      // Get all active sensors
      const sensors = await this.sensorRepository.findByActive(true);

      if (sensors.length === 0) {
        this.logger.warn('No active sensors found');
        return;
      }

      this.logger.info(`Collecting data from ${sensors.length} sensors`);

      // Simulate data collection for each sensor
      for (const sensor of sensors) {
        const sensorData = sensor.toJSON();
        const limits = sensorData.limits;

        // Generate random temperature and humidity
        const temperature = this.generateRandomValue(
          limits.minTemperature - 10,
          limits.maxTemperature + 10
        );
        const humidity = this.generateRandomValue(
          Math.max(0, limits.minHumidity - 10),
          Math.min(100, limits.maxHumidity + 10)
        );

        // Validate with value objects
        try {
          new Temperature(temperature);
          new Humidity(humidity);
        } catch (error) {
          this.logger.warn('Generated invalid sensor data', { temperature, humidity, error });
          continue;
        }

        // Publish to RabbitMQ
        const message: SensorDataMessage = {
          sensorId: sensorData.id!,
          temperature,
          humidity,
          timestamp: new Date(),
        };

        await this.messageQueue.publish('sensor-data', message);

        this.logger.info('Sensor data published', {
          sensorId: sensorData.id,
          sensorName: sensorData.name,
          temperature,
          humidity,
        });
      }
    } catch (error) {
      this.logger.error('Failed to collect sensor data', error as Error);
      throw error;
    }
  }

  private generateRandomValue(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  }
}
