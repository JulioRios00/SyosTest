import { Sensor } from '../../domain/entities/Sensor';
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { ILogger } from '../../domain/ports/ILogger';
import { RegisterSensorDTO, SensorResponseDTO } from '../dtos/SensorDTO';

export class RegisterSensorUseCase {
  constructor(
    private readonly sensorRepository: ISensorRepository,
    private readonly logger: ILogger
  ) {}

  async execute(dto: RegisterSensorDTO): Promise<SensorResponseDTO> {
    try {
      this.logger.info('Registering new sensor', { name: dto.name, location: dto.location });

      // Create domain entity
      const sensor = new Sensor({
        name: dto.name,
        location: dto.location,
        limits: dto.limits,
        isActive: true,
      });

      // Persist through repository
      const savedSensor = await this.sensorRepository.save(sensor);

      this.logger.info('Sensor registered successfully', { sensorId: savedSensor.getId() });

      // Map to DTO
      return this.mapToResponseDTO(savedSensor);
    } catch (error) {
      this.logger.error('Failed to register sensor', error as Error, { dto });
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
