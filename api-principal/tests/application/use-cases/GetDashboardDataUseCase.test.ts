// Unit tests for GetDashboardDataUseCase

import { GetDashboardDataUseCase } from '../../../src/application/use-cases/GetDashboardDataUseCase';
import { ISensorRepository } from '../../../src/domain/ports/ISensorRepository';
import { IAlertRepository } from '../../../src/domain/ports/IAlertRepository';
import { ILogger } from '../../../src/domain/ports/ILogger';
import { Sensor } from '../../../src/domain/entities/Sensor';
import { Alert, AlertType, AlertSeverity } from '../../../src/domain/entities/Alert';

describe('GetDashboardDataUseCase', () => {
  let useCase: GetDashboardDataUseCase;
  let mockSensorRepository: jest.Mocked<ISensorRepository>;
  let mockAlertRepository: jest.Mocked<IAlertRepository>;
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

    mockAlertRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySensorId: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    useCase = new GetDashboardDataUseCase(
      mockSensorRepository,
      mockAlertRepository,
      mockLogger
    );
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

    const createMockAlert = (
      sensorId: string,
      type: AlertType,
      severity: AlertSeverity
    ) => {
      return new Alert({
        sensorId,
        type,
        severity,
        temperature: 28,
        humidity: 55,
        message: 'Test alert',
      });
    };

    it('should return dashboard data with sensors and alerts', async () => {
      const sensors = [
        createMockSensor('Sensor 1', true),
        createMockSensor('Sensor 2', true),
        createMockSensor('Sensor 3', false),
      ];
      const alerts = [
        createMockAlert('sensor-1', AlertType.TEMPERATURE_HIGH, AlertSeverity.WARNING),
        createMockAlert('sensor-2', AlertType.HUMIDITY_LOW, AlertSeverity.CRITICAL),
      ];

      mockSensorRepository.findAll.mockResolvedValue(sensors);
      mockAlertRepository.findAll.mockResolvedValue(alerts);

      const result = await useCase.execute();

      expect(result.sensors).toEqual(sensors);
      expect(result.alerts).toEqual(alerts);
      expect(result.sensors).toHaveLength(3);
      expect(result.alerts).toHaveLength(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Fetching dashboard data')
      );
    });

    it('should handle empty sensors', async () => {
      mockSensorRepository.findAll.mockResolvedValue([]);
      mockAlertRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.sensors).toEqual([]);
      expect(result.alerts).toEqual([]);
    });

    it('should handle empty alerts', async () => {
      const sensors = [createMockSensor('Sensor 1')];
      mockSensorRepository.findAll.mockResolvedValue(sensors);
      mockAlertRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.sensors).toHaveLength(1);
      expect(result.alerts).toEqual([]);
    });

    it('should throw error when sensor repository fails', async () => {
      const error = new Error('Sensor query error');
      mockSensorRepository.findAll.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Sensor query error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should throw error when alert repository fails', async () => {
      const sensors = [createMockSensor('Sensor 1')];
      mockSensorRepository.findAll.mockResolvedValue(sensors);
      
      const error = new Error('Alert query error');
      mockAlertRepository.findAll.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow('Alert query error');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return sensors with mixed active states', async () => {
      const sensors = [
        createMockSensor('Active Sensor', true),
        createMockSensor('Inactive Sensor', false),
      ];
      mockSensorRepository.findAll.mockResolvedValue(sensors);
      mockAlertRepository.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result.sensors[0].getIsActive()).toBe(true);
      expect(result.sensors[1].getIsActive()).toBe(false);
    });
  });
});
