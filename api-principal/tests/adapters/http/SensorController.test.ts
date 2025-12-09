// Unit tests for SensorController

import { Request, Response } from 'express';
import { SensorController } from '../../../src/adapters/http/SensorController';
import { RegisterSensorUseCase } from '../../../src/application/use-cases/RegisterSensorUseCase';
import { GetSensorsUseCase } from '../../../src/application/use-cases/GetSensorsUseCase';
import { Sensor } from '../../../src/domain/entities/Sensor';

describe('SensorController', () => {
  let controller: SensorController;
  let mockRegisterSensorUseCase: jest.Mocked<RegisterSensorUseCase>;
  let mockGetSensorsUseCase: jest.Mocked<GetSensorsUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRegisterSensorUseCase = {
      execute: jest.fn(),
    } as any;

    mockGetSensorsUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new SensorController(
      mockRegisterSensorUseCase,
      mockGetSensorsUseCase
    );

    mockRequest = {
      body: {},
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('register', () => {
    const validSensorData = {
      name: 'Test Sensor',
      location: 'Lab A',
      limits: {
        minTemperature: 18,
        maxTemperature: 26,
        minHumidity: 40,
        maxHumidity: 60,
      },
    };

    it('should register sensor and return 201', async () => {
      mockRequest.body = validSensorData;
      const sensor = new Sensor(validSensorData);
      mockRegisterSensorUseCase.execute.mockResolvedValue(sensor);

      await controller.register(mockRequest as Request, mockResponse as Response);

      expect(mockRegisterSensorUseCase.execute).toHaveBeenCalledWith(validSensorData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        id: sensor.getId(),
        name: 'Test Sensor',
        location: 'Lab A',
      }));
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = { name: '', location: 'Lab A' };
      mockRegisterSensorUseCase.execute.mockRejectedValue(
        new Error('Sensor name is required')
      );

      await controller.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Sensor name is required',
        })
      );
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.body = validSensorData;
      mockRegisterSensorUseCase.execute.mockRejectedValue(
        new Error('Database connection failed')
      );

      await controller.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getSensors', () => {
    const createMockSensor = (name: string) => {
      return new Sensor({
        name,
        location: 'Test Location',
        limits: {
          minTemperature: 18,
          maxTemperature: 26,
          minHumidity: 40,
          maxHumidity: 60,
        },
      });
    };

    it('should get all sensors and return 200', async () => {
      const sensors = [
        createMockSensor('Sensor 1'),
        createMockSensor('Sensor 2'),
      ];
      mockGetSensorsUseCase.execute.mockResolvedValue(sensors);

      await controller.getSensors(mockRequest as Request, mockResponse as Response);

      expect(mockGetSensorsUseCase.execute).toHaveBeenCalledWith({ activeOnly: true });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Sensor 1' }),
          expect.objectContaining({ name: 'Sensor 2' }),
        ])
      );
    });

    it('should respect activeOnly query parameter', async () => {
      mockRequest.query = { activeOnly: 'false' };
      const sensors = [createMockSensor('Sensor 1')];
      mockGetSensorsUseCase.execute.mockResolvedValue(sensors);

      await controller.getSensors(mockRequest as Request, mockResponse as Response);

      expect(mockGetSensorsUseCase.execute).toHaveBeenCalledWith({ activeOnly: false });
    });

    it('should return empty array when no sensors exist', async () => {
      mockGetSensorsUseCase.execute.mockResolvedValue([]);

      await controller.getSensors(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors gracefully', async () => {
      mockGetSensorsUseCase.execute.mockRejectedValue(
        new Error('Database error')
      );

      await controller.getSensors(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
