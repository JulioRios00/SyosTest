// Unit tests for CollectSensorDataUseCase

import { CollectSensorDataUseCase } from '../../../src/application/use-cases/CollectSensorDataUseCase';
import { IMessageQueue } from '../../../src/domain/ports/IMessageQueue';
import { ILogger } from '../../../src/domain/ports/ILogger';

describe('CollectSensorDataUseCase', () => {
  let useCase: CollectSensorDataUseCase;
  let mockMessageQueue: jest.Mocked<IMessageQueue>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockMessageQueue = {
      publish: jest.fn(),
      consume: jest.fn(),
      close: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    useCase = new CollectSensorDataUseCase(mockMessageQueue, mockLogger);
  });

  describe('execute', () => {
    const mockSensors = [
      {
        id: 'sensor-1',
        name: 'Sensor 1',
        location: 'Lab A',
        isActive: true,
        limits: {
          minTemperature: 18,
          maxTemperature: 26,
          minHumidity: 40,
          maxHumidity: 60,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should collect and publish sensor data', async () => {
      await useCase.execute(mockSensors);

      expect(mockMessageQueue.publish).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Collecting sensor data')
      );
    });

    it('should publish data with correct structure', async () => {
      await useCase.execute(mockSensors);

      const publishedData = (mockMessageQueue.publish as jest.Mock).mock.calls[0][1];
      expect(publishedData).toHaveProperty('sensorId', 'sensor-1');
      expect(publishedData).toHaveProperty('temperature');
      expect(publishedData).toHaveProperty('humidity');
      expect(publishedData).toHaveProperty('timestamp');
    });

    it('should generate temperature within reasonable range', async () => {
      await useCase.execute(mockSensors);

      const publishedData = (mockMessageQueue.publish as jest.Mock).mock.calls[0][1];
      expect(publishedData.temperature).toBeGreaterThanOrEqual(-50);
      expect(publishedData.temperature).toBeLessThanOrEqual(50);
    });

    it('should generate humidity between 0 and 100', async () => {
      await useCase.execute(mockSensors);

      const publishedData = (mockMessageQueue.publish as jest.Mock).mock.calls[0][1];
      expect(publishedData.humidity).toBeGreaterThanOrEqual(0);
      expect(publishedData.humidity).toBeLessThanOrEqual(100);
    });

    it('should include timestamp in data', async () => {
      await useCase.execute(mockSensors);

      const publishedData = (mockMessageQueue.publish as jest.Mock).mock.calls[0][1];
      expect(publishedData.timestamp).toBeInstanceOf(Date);
    });

    it('should handle empty sensor array', async () => {
      await useCase.execute([]);

      expect(mockMessageQueue.publish).not.toHaveBeenCalled();
    });

    it('should process multiple sensors', async () => {
      const multipleSensors = [
        { ...mockSensors[0], id: 'sensor-1' },
        { ...mockSensors[0], id: 'sensor-2' },
        { ...mockSensors[0], id: 'sensor-3' },
      ];

      await useCase.execute(multipleSensors);

      expect(mockMessageQueue.publish).toHaveBeenCalledTimes(3);
    });

    it('should handle message queue errors', async () => {
      mockMessageQueue.publish.mockRejectedValue(new Error('Queue error'));

      await expect(useCase.execute(mockSensors)).rejects.toThrow('Queue error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
