// Unit tests for DashboardController

import { Request, Response } from 'express';
import { DashboardController } from '../../../src/adapters/http/DashboardController';
import { GetDashboardDataUseCase } from '../../../src/application/use-cases/GetDashboardDataUseCase';
import { Sensor } from '../../../src/domain/entities/Sensor';
import { Alert, AlertType, AlertSeverity } from '../../../src/domain/entities/Alert';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockGetDashboardDataUseCase: jest.Mocked<GetDashboardDataUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockGetDashboardDataUseCase = {
      execute: jest.fn(),
    } as any;

    controller = new DashboardController(mockGetDashboardDataUseCase);

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      json: jest.fn(),
    };
  });

  describe('getDashboard', () => {
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

    const createMockAlert = (severity: AlertSeverity) => {
      return new Alert({
        sensorId: 'sensor-123',
        type: AlertType.TEMPERATURE_HIGH,
        severity,
        temperature: 28,
        humidity: 55,
        message: 'Test alert',
      });
    };

    it('should render dashboard with data', async () => {
      const sensors = [
        createMockSensor('Sensor 1', true),
        createMockSensor('Sensor 2', false),
      ];
      const alerts = [
        createMockAlert(AlertSeverity.WARNING),
        createMockAlert(AlertSeverity.CRITICAL),
      ];

      mockGetDashboardDataUseCase.execute.mockResolvedValue({ sensors, alerts });

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockGetDashboardDataUseCase.execute).toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('dashboard', expect.any(Object));
    });

    it('should pass correct statistics to template', async () => {
      const sensors = [
        createMockSensor('Sensor 1', true),
        createMockSensor('Sensor 2', true),
        createMockSensor('Sensor 3', false),
      ];
      const alerts = [
        createMockAlert(AlertSeverity.CRITICAL),
        createMockAlert(AlertSeverity.WARNING),
        createMockAlert(AlertSeverity.WARNING),
      ];

      mockGetDashboardDataUseCase.execute.mockResolvedValue({ sensors, alerts });

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'dashboard',
        expect.objectContaining({
          totalSensors: 3,
          activeSensors: 2,
          totalAlerts: 3,
          criticalAlerts: 1,
        })
      );
    });

    it('should pass sensors and alerts to template', async () => {
      const sensors = [createMockSensor('Sensor 1')];
      const alerts = [createMockAlert(AlertSeverity.WARNING)];

      mockGetDashboardDataUseCase.execute.mockResolvedValue({ sensors, alerts });

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      const renderCall = (mockResponse.render as jest.Mock).mock.calls[0];
      expect(renderCall[1].sensors).toHaveLength(1);
      expect(renderCall[1].alerts).toHaveLength(1);
    });

    it('should handle empty data', async () => {
      mockGetDashboardDataUseCase.execute.mockResolvedValue({ 
        sensors: [], 
        alerts: [] 
      });

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'dashboard',
        expect.objectContaining({
          totalSensors: 0,
          activeSensors: 0,
          totalAlerts: 0,
          criticalAlerts: 0,
        })
      );
    });

    it('should handle errors gracefully', async () => {
      mockGetDashboardDataUseCase.execute.mockRejectedValue(
        new Error('Database error')
      );

      await controller.getDashboard(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });
});
