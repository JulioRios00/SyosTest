// Unit tests for GetSensorsUseCase

import { GetSensorsUseCase } from '../../../src/application/use-cases/GetSensorsUseCase';
import { ISensorRepository } from '../../../src/domain/ports/ISensorRepository';
import { ILogger } from '../../../src/domain/ports/ILogger';
import { Sensor } from '../../../src/domain/entities/Sensor';

describe('GetSensorsUseCase', () => {
  let useCase: GetSensorsUseCase;
  let mockSensorRepository: jest.Mocked<ISensorRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockSensorRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllActive: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    useCase = new GetSensorsUseCase(mockSensorRepository, mockLogger);
  });

  describe('execute', () => {
    const createMockSensor = (name: string, isActive = true) => {
      return new Sensor({
        name,
        location: 'Test Location',
        isActive,
        limits: {
          minTemperature: 18,
          maxTemperature: 26,
          minHumidity: 40,
          maxHumidity: 60,
        },
      });
    };

    it('should get all sensors when activeOnly is false', async () => {
      const sensors = [
        createMockSensor('Sensor 1', true),
        createMockSensor('Sensor 2', false),
        createMockSensor('Sensor 3', true),
      ];
      mockSensorRepository.findAll.mockResolvedValue(sensors);

      const result = await useCase.execute({ activeOnly: false });

      expect(result).toEqual(sensors);
      expect(result).toHaveLength(3);
      expect(mockSensorRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockSensorRepository.findAllActive).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching all sensors')
      );
    });

    it('should get only active sensors when activeOnly is true', async () => {
      const activeSensors = [
        createMockSensor('Sensor 1', true),
        createMockSensor('Sensor 2', true),
      ];
      mockSensorRepository.findAllActive.mockResolvedValue(activeSensors);

      const result = await useCase.execute({ activeOnly: true });

      expect(result).toEqual(activeSensors);
      expect(result).toHaveLength(2);
      expect(mockSensorRepository.findAllActive).toHaveBeenCalledTimes(1);
      expect(mockSensorRepository.findAll).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching active sensors')
      );
    });

    it('should default to activeOnly true when not specified', async () => {
      const activeSensors = [createMockSensor('Sensor 1', true)];
      mockSensorRepository.findAllActive.mockResolvedValue(activeSensors);

      const result = await useCase.execute();

      expect(result).toEqual(activeSensors);
      expect(mockSensorRepository.findAllActive).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no sensors found', async () => {
      mockSensorRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute({ activeOnly: false });

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database connection error');
      mockSensorRepository.findAllActive.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Database connection error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
