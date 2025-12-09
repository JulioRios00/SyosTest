// Unit tests for SensorLimits Value Object

import { SensorLimits } from '../../../src/domain/value-objects/SensorLimits';

describe('SensorLimits Value Object', () => {
  const validLimits = {
    minTemperature: 18,
    maxTemperature: 26,
    minHumidity: 40,
    maxHumidity: 60,
  };

  describe('Valid Limits', () => {
    it('should create sensor limits with valid values', () => {
      const limits = new SensorLimits(validLimits);

      expect(limits.getMinTemperature()).toBe(18);
      expect(limits.getMaxTemperature()).toBe(26);
      expect(limits.getMinHumidity()).toBe(40);
      expect(limits.getMaxHumidity()).toBe(60);
    });

    it('should accept wide temperature range', () => {
      const limits = new SensorLimits({
        ...validLimits,
        minTemperature: -50,
        maxTemperature: 150,
      });

      expect(limits.getMinTemperature()).toBe(-50);
      expect(limits.getMaxTemperature()).toBe(150);
    });

    it('should accept full humidity range', () => {
      const limits = new SensorLimits({
        ...validLimits,
        minHumidity: 0,
        maxHumidity: 100,
      });

      expect(limits.getMinHumidity()).toBe(0);
      expect(limits.getMaxHumidity()).toBe(100);
    });
  });

  describe('Invalid Temperature Limits', () => {
    it('should throw error when min >= max temperature', () => {
      const props = { ...validLimits, minTemperature: 26, maxTemperature: 26 };
      expect(() => new SensorLimits(props)).toThrow(
        'Min temperature must be less than max temperature'
      );
    });

    it('should throw error when min > max temperature', () => {
      const props = { ...validLimits, minTemperature: 30, maxTemperature: 20 };
      expect(() => new SensorLimits(props)).toThrow(
        'Min temperature must be less than max temperature'
      );
    });
  });

  describe('Invalid Humidity Limits', () => {
    it('should throw error when min >= max humidity', () => {
      const props = { ...validLimits, minHumidity: 60, maxHumidity: 60 };
      expect(() => new SensorLimits(props)).toThrow(
        'Min humidity must be less than max humidity'
      );
    });

    it('should throw error when min > max humidity', () => {
      const props = { ...validLimits, minHumidity: 70, maxHumidity: 50 };
      expect(() => new SensorLimits(props)).toThrow(
        'Min humidity must be less than max humidity'
      );
    });

    it('should throw error when humidity below 0', () => {
      const props = { ...validLimits, minHumidity: -1 };
      expect(() => new SensorLimits(props)).toThrow(
        'Humidity limits must be between 0 and 100'
      );
    });

    it('should throw error when humidity above 100', () => {
      const props = { ...validLimits, maxHumidity: 101 };
      expect(() => new SensorLimits(props)).toThrow(
        'Humidity limits must be between 0 and 100'
      );
    });
  });

  describe('Validation Methods', () => {
    it('should correctly validate temperature within limits', () => {
      const limits = new SensorLimits(validLimits);

      expect(limits.isTemperatureWithinLimits(20)).toBe(true);
      expect(limits.isTemperatureWithinLimits(18)).toBe(true);
      expect(limits.isTemperatureWithinLimits(26)).toBe(true);
    });

    it('should correctly validate temperature outside limits', () => {
      const limits = new SensorLimits(validLimits);

      expect(limits.isTemperatureWithinLimits(17)).toBe(false);
      expect(limits.isTemperatureWithinLimits(27)).toBe(false);
    });

    it('should correctly validate humidity within limits', () => {
      const limits = new SensorLimits(validLimits);

      expect(limits.isHumidityWithinLimits(50)).toBe(true);
      expect(limits.isHumidityWithinLimits(40)).toBe(true);
      expect(limits.isHumidityWithinLimits(60)).toBe(true);
    });

    it('should correctly validate humidity outside limits', () => {
      const limits = new SensorLimits(validLimits);

      expect(limits.isHumidityWithinLimits(39)).toBe(false);
      expect(limits.isHumidityWithinLimits(61)).toBe(false);
    });
  });
});
