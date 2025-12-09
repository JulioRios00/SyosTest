// Unit tests for Sensor Entity

import { Sensor } from '../../../src/domain/entities/Sensor';

describe('Sensor Entity', () => {
  const validSensorProps = {
    name: 'Test Sensor',
    location: 'Lab A',
    limits: {
      minTemperature: 18,
      maxTemperature: 26,
      minHumidity: 40,
      maxHumidity: 60,
    },
  };

  describe('Creation', () => {
    it('should create a sensor with valid properties', () => {
      const sensor = new Sensor(validSensorProps);

      expect(sensor.getName()).toBe('Test Sensor');
      expect(sensor.getLocation()).toBe('Lab A');
      expect(sensor.getIsActive()).toBe(true);
      expect(sensor.getLimits().getMinTemperature()).toBe(18);
      expect(sensor.getLimits().getMaxTemperature()).toBe(26);
    });

    it('should throw error when name is empty', () => {
      const props = { ...validSensorProps, name: '' };
      expect(() => new Sensor(props)).toThrow('Sensor name is required');
    });

    it('should throw error when location is empty', () => {
      const props = { ...validSensorProps, location: '' };
      expect(() => new Sensor(props)).toThrow('Sensor location is required');
    });

    it('should create sensor with provided id', () => {
      const props = { ...validSensorProps, id: 'test-id-123' };
      const sensor = new Sensor(props);
      expect(sensor.getId()).toBe('test-id-123');
    });

    it('should set isActive to false when provided', () => {
      const props = { ...validSensorProps, isActive: false };
      const sensor = new Sensor(props);
      expect(sensor.getIsActive()).toBe(false);
    });
  });

  describe('Activation/Deactivation', () => {
    it('should activate sensor', () => {
      const props = { ...validSensorProps, isActive: false };
      const sensor = new Sensor(props);
      
      sensor.activate();
      
      expect(sensor.getIsActive()).toBe(true);
    });

    it('should deactivate sensor', () => {
      const sensor = new Sensor(validSensorProps);
      
      sensor.deactivate();
      
      expect(sensor.getIsActive()).toBe(false);
    });

    it('should update updatedAt when activating', () => {
      const props = { ...validSensorProps, isActive: false };
      const sensor = new Sensor(props);
      const originalUpdatedAt = sensor.getUpdatedAt();
      
      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        sensor.activate();
        expect(sensor.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });
  });

  describe('Update Operations', () => {
    it('should update sensor name', () => {
      const sensor = new Sensor(validSensorProps);
      
      sensor.updateName('New Sensor Name');
      
      expect(sensor.getName()).toBe('New Sensor Name');
    });

    it('should throw error when updating to empty name', () => {
      const sensor = new Sensor(validSensorProps);
      
      expect(() => sensor.updateName('')).toThrow('Sensor name cannot be empty');
    });

    it('should update sensor location', () => {
      const sensor = new Sensor(validSensorProps);
      
      sensor.updateLocation('New Location');
      
      expect(sensor.getLocation()).toBe('New Location');
    });

    it('should throw error when updating to empty location', () => {
      const sensor = new Sensor(validSensorProps);
      
      expect(() => sensor.updateLocation('')).toThrow('Sensor location cannot be empty');
    });

    it('should update sensor limits', () => {
      const sensor = new Sensor(validSensorProps);
      const newLimits = {
        minTemperature: 20,
        maxTemperature: 28,
        minHumidity: 45,
        maxHumidity: 65,
      };
      
      sensor.updateLimits(newLimits);
      
      expect(sensor.getLimits().getMinTemperature()).toBe(20);
      expect(sensor.getLimits().getMaxTemperature()).toBe(28);
    });
  });

  describe('JSON Serialization', () => {
    it('should convert to JSON correctly', () => {
      const sensor = new Sensor({ ...validSensorProps, id: 'sensor-123' });
      
      const json = sensor.toJSON();
      
      expect(json).toMatchObject({
        id: 'sensor-123',
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
      expect(json.createdAt).toBeInstanceOf(Date);
      expect(json.updatedAt).toBeInstanceOf(Date);
    });
  });
});
