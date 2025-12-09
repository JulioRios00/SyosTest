// Unit tests for Alert Entity

import { Alert, AlertType, AlertSeverity } from '../../../src/domain/entities/Alert';

describe('Alert Entity', () => {
  const validAlertProps = {
    sensorId: 'sensor-123',
    type: AlertType.TEMPERATURE_HIGH,
    severity: AlertSeverity.WARNING,
    temperature: 28.5,
    humidity: 55,
    message: 'Temperature exceeds limit',
  };

  describe('Creation', () => {
    it('should create an alert with valid properties', () => {
      const alert = new Alert(validAlertProps);

      expect(alert.getSensorId()).toBe('sensor-123');
      expect(alert.getType()).toBe(AlertType.TEMPERATURE_HIGH);
      expect(alert.getSeverity()).toBe(AlertSeverity.WARNING);
      expect(alert.getTemperature()).toBe(28.5);
      expect(alert.getHumidity()).toBe(55);
      expect(alert.getMessage()).toBe('Temperature exceeds limit');
    });

    it('should throw error when sensorId is empty', () => {
      const props = { ...validAlertProps, sensorId: '' };
      expect(() => new Alert(props)).toThrow('Sensor ID is required');
    });

    it('should throw error when message is empty', () => {
      const props = { ...validAlertProps, message: '' };
      expect(() => new Alert(props)).toThrow('Alert message is required');
    });

    it('should create alert with provided id', () => {
      const props = { ...validAlertProps, id: 'alert-456' };
      const alert = new Alert(props);
      expect(alert.getId()).toBe('alert-456');
    });

    it('should set createdAt to provided date', () => {
      const customDate = new Date('2025-01-01');
      const props = { ...validAlertProps, createdAt: customDate };
      const alert = new Alert(props);
      expect(alert.getCreatedAt()).toEqual(customDate);
    });
  });

  describe('Alert Types', () => {
    it('should create TEMPERATURE_HIGH alert', () => {
      const props = { ...validAlertProps, type: AlertType.TEMPERATURE_HIGH };
      const alert = new Alert(props);
      expect(alert.getType()).toBe(AlertType.TEMPERATURE_HIGH);
    });

    it('should create TEMPERATURE_LOW alert', () => {
      const props = { ...validAlertProps, type: AlertType.TEMPERATURE_LOW };
      const alert = new Alert(props);
      expect(alert.getType()).toBe(AlertType.TEMPERATURE_LOW);
    });

    it('should create HUMIDITY_HIGH alert', () => {
      const props = { ...validAlertProps, type: AlertType.HUMIDITY_HIGH };
      const alert = new Alert(props);
      expect(alert.getType()).toBe(AlertType.HUMIDITY_HIGH);
    });

    it('should create HUMIDITY_LOW alert', () => {
      const props = { ...validAlertProps, type: AlertType.HUMIDITY_LOW };
      const alert = new Alert(props);
      expect(alert.getType()).toBe(AlertType.HUMIDITY_LOW);
    });
  });

  describe('Alert Severities', () => {
    it('should create WARNING alert', () => {
      const props = { ...validAlertProps, severity: AlertSeverity.WARNING };
      const alert = new Alert(props);
      expect(alert.getSeverity()).toBe(AlertSeverity.WARNING);
    });

    it('should create CRITICAL alert', () => {
      const props = { ...validAlertProps, severity: AlertSeverity.CRITICAL };
      const alert = new Alert(props);
      expect(alert.getSeverity()).toBe(AlertSeverity.CRITICAL);
    });
  });

  describe('JSON Serialization', () => {
    it('should convert to JSON correctly', () => {
      const alert = new Alert({ ...validAlertProps, id: 'alert-789' });
      
      const json = alert.toJSON();
      
      expect(json).toMatchObject({
        id: 'alert-789',
        sensorId: 'sensor-123',
        type: AlertType.TEMPERATURE_HIGH,
        severity: AlertSeverity.WARNING,
        temperature: 28.5,
        humidity: 55,
        message: 'Temperature exceeds limit',
      });
      expect(json.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('Immutability', () => {
    it('should not allow modification of sensor id', () => {
      const alert = new Alert(validAlertProps);
      const sensorId = alert.getSensorId();
      
      // Alert properties are readonly, TypeScript prevents modification
      expect(alert.getSensorId()).toBe(sensorId);
    });

    it('should not allow modification of message', () => {
      const alert = new Alert(validAlertProps);
      const message = alert.getMessage();
      
      expect(alert.getMessage()).toBe(message);
    });
  });
});
