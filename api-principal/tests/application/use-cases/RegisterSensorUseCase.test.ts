// Unit tests for RegisterSensorUseCase

import { RegisterSensorUseCase } from '../../../src/application/use-cases/RegisterSensorUseCase';
import { ISensorRepository } from '../../../src/domain/ports/ISensorRepository';
import { ILogger } from '../../../src/domain/ports/ILogger';
import { Sensor } from '../../../src/domain/entities/Sensor';

describe('RegisterSensorUseCase', () => {
  let useCase: RegisterSensorUseCase;
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

    useCase = new RegisterSensorUseCase(mockSensorRepository, mockLogger);
  });

  describe('execute', () => {
    const validDTO = {
      name: 'Test Sensor',
      location: 'Lab A',
      limits: {
        minTemperature: 18,
        maxTemperature: 26,
        minHumidity: 40,
        maxHumidity: 60,
      },
    };

    it('should register a new sensor successfully', async () => {
      const savedSensor = new Sensor(validDTO);
      mockSensorRepository.save.mockResolvedValue(savedSensor);

      const result = await useCase.execute(validDTO);

      expect(result).toEqual(savedSensor);
      expect(mockSensorRepository.save).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Registering sensor')
      );
    });

    it('should pass sensor to repository', async () => {
      const savedSensor = new Sensor(validDTO);
      mockSensorRepository.save.mockResolvedValue(savedSensor);

      await useCase.execute(validDTO);

      const savedCall = mockSensorRepository.save.mock.calls[0][0];
      expect(savedCall).toBeInstanceOf(Sensor);
      expect(savedCall.getName()).toBe('Test Sensor');
      expect(savedCall.getLocation()).toBe('Lab A');
    });

    it('should throw error when repository fails', async () => {
      const error = new Error('Database error');
      mockSensorRepository.save.mockRejectedValue(error);

      await expect(useCase.execute(validDTO)).rejects.toThrow('Database error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should validate temperature limits', async () => {
      const invalidDTO = {
        ...validDTO,
        limits: { ...validDTO.limits, minTemperature: 30, maxTemperature: 20 },
      };

      await expect(useCase.execute(invalidDTO)).rejects.toThrow();
    });

    it('should validate humidity limits', async () => {
      const invalidDTO = {
        ...validDTO,
        limits: { ...validDTO.limits, minHumidity: 70, maxHumidity: 50 },
      };

      await expect(useCase.execute(invalidDTO)).rejects.toThrow();
    });

    it('should reject empty sensor name', async () => {
      const invalidDTO = { ...validDTO, name: '' };

      await expect(useCase.execute(invalidDTO)).rejects.toThrow('Sensor name is required');
    });

    it('should reject empty location', async () => {
      const invalidDTO = { ...validDTO, location: '' };

      await expect(useCase.execute(invalidDTO)).rejects.toThrow('Sensor location is required');
    });
  });
});
