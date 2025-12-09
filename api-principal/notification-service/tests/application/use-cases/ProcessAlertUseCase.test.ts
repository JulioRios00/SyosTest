// Unit tests for ProcessAlertUseCase

import { ProcessAlertUseCase } from '../../../src/application/use-cases/ProcessAlertUseCase';
import { IAlertRepository } from '../../../src/domain/ports/IAlertRepository';
import { ISensorRepository } from '../../../src/domain/ports/ISensorRepository';
import { ILogger } from '../../../src/domain/ports/ILogger';
import { Sensor } from '../../../src/domain/entities/Sensor';
import { Alert, AlertType, AlertSeverity } from '../../../src/domain/entities/Alert';

describe('ProcessAlertUseCase', () => {
  let useCase: ProcessAlertUseCase;
  let mockAlertRepository: jest.Mocked<IAlertRepository>;
  let mockSensorRepository: jest.Mocked<ISensorRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockAlertRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySensorId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

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

    useCase = new ProcessAlertUseCase(
      mockAlertRepository,
      mockSensorRepository,
      mockLogger
    );
  });

  describe('execute', () => {
    const createMockSensor = (id: string) => {
      return new Sensor({
        id,
        name: 'Test Sensor',
        location: 'Lab A',
        isActive: true,
        limits: {
          minTemperature: 18,
          maxTemperature: 26,
          minHumidity: 40,
          maxHumidity: 60,
        },
      });
    };

    it('should create alert for temperature above limit', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 30, // Above max 26
        humidity: 50,
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).toHaveBeenCalledTimes(1);
      const savedAlert = (mockAlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert).toBeInstanceOf(Alert);
      expect(savedAlert.getType()).toBe(AlertType.TEMPERATURE_HIGH);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should create alert for temperature below limit', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 15, // Below min 18
        humidity: 50,
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).toHaveBeenCalledTimes(1);
      const savedAlert = (mockAlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.getType()).toBe(AlertType.TEMPERATURE_LOW);
    });

    it('should create alert for humidity above limit', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 22,
        humidity: 70, // Above max 60
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).toHaveBeenCalledTimes(1);
      const savedAlert = (mockAlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.getType()).toBe(AlertType.HUMIDITY_HIGH);
    });

    it('should create alert for humidity below limit', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 22,
        humidity: 30, // Below min 40
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).toHaveBeenCalledTimes(1);
      const savedAlert = (mockAlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.getType()).toBe(AlertType.HUMIDITY_LOW);
    });

    it('should not create alert when values within limits', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 22, // Within 18-26
        humidity: 50, // Within 40-60
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('within limits')
      );
    });

    it('should create CRITICAL alert for extreme temperature deviation', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 35, // 9 degrees above max (>5 threshold)
        humidity: 50,
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      const savedAlert = (mockAlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.getSeverity()).toBe(AlertSeverity.CRITICAL);
    });

    it('should create WARNING alert for moderate deviation', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 28, // 2 degrees above max (<5 threshold)
        humidity: 50,
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      const savedAlert = (mockAlertRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedAlert.getSeverity()).toBe(AlertSeverity.WARNING);
    });

    it('should handle sensor not found', async () => {
      mockSensorRepository.findById.mockResolvedValue(null);

      const sensorData = {
        sensorId: 'non-existent',
        temperature: 22,
        humidity: 50,
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Sensor not found')
      );
    });

    it('should handle inactive sensor', async () => {
      const inactiveSensor = new Sensor({
        id: 'sensor-1',
        name: 'Test Sensor',
        location: 'Lab A',
        isActive: false, // Inactive
        limits: {
          minTemperature: 18,
          maxTemperature: 26,
          minHumidity: 40,
          maxHumidity: 60,
        },
      });
      mockSensorRepository.findById.mockResolvedValue(inactiveSensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 30,
        humidity: 50,
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      expect(mockAlertRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('inactive')
      );
    });

    it('should handle multiple violations simultaneously', async () => {
      const sensor = createMockSensor('sensor-1');
      mockSensorRepository.findById.mockResolvedValue(sensor);

      const sensorData = {
        sensorId: 'sensor-1',
        temperature: 30, // Above limit
        humidity: 70, // Above limit
        timestamp: new Date(),
      };

      await useCase.execute(sensorData);

      // Should create alerts for both violations
      expect(mockAlertRepository.save).toHaveBeenCalledTimes(2);
    });
  });
});
