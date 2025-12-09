
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { ILogger } from '../../domain/ports/ILogger';
import { SensorResponseDTO } from '../dtos/SensorDTO';
import { Sensor } from '../../domain/entities/Sensor';

export class GetSensorsUseCase {
  constructor(
    private readonly sensorRepository: ISensorRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<SensorResponseDTO[]> {
    try {
      this.logger.info('Fetching all sensors');

      const sensors = await this.sensorRepository.findAll();

      this.logger.info('Sensors fetched successfully', { count: sensors.length });

      return sensors.map(sensor => this.mapToResponseDTO(sensor));
    } catch (error) {
      this.logger.error('Failed to fetch sensors', error as Error);
      throw error;
    }
  }

  async executeActive(): Promise<SensorResponseDTO[]> {
    try {
      this.logger.info('Fetching active sensors');

      const sensors = await this.sensorRepository.findByActive(true);

      this.logger.info('Active sensors fetched successfully', { count: sensors.length });

      return sensors.map(sensor => this.mapToResponseDTO(sensor));
    } catch (error) {
      this.logger.error('Failed to fetch active sensors', error as Error);
      throw error;
    }
  }

  private mapToResponseDTO(sensor: Sensor): SensorResponseDTO {
    const sensorData = sensor.toJSON();
    return {
      id: sensorData.id!,
      name: sensorData.name,
      location: sensorData.location,
      limits: sensorData.limits,
      isActive: sensorData.isActive,
      createdAt: sensorData.createdAt,
      updatedAt: sensorData.updatedAt,
    };
  }
}
