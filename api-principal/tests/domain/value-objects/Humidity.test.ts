// Unit tests for Humidity Value Object

import { Humidity } from '../../../src/domain/value-objects/Humidity';

describe('Humidity Value Object', () => {
  describe('Valid Humidity', () => {
    it('should create humidity with valid value', () => {
      const humidity = new Humidity(50);
      expect(humidity.getValue()).toBe(50);
    });

    it('should accept minimum value (0)', () => {
      const humidity = new Humidity(0);
      expect(humidity.getValue()).toBe(0);
    });

    it('should accept maximum value (100)', () => {
      const humidity = new Humidity(100);
      expect(humidity.getValue()).toBe(100);
    });

    it('should accept decimal values', () => {
      const humidity = new Humidity(45.5);
      expect(humidity.getValue()).toBe(45.5);
    });
  });

  describe('Invalid Humidity', () => {
    it('should throw error for negative humidity', () => {
      expect(() => new Humidity(-1)).toThrow('Humidity must be between 0 and 100');
    });

    it('should throw error for humidity above 100', () => {
      expect(() => new Humidity(101)).toThrow('Humidity must be between 0 and 100');
    });
  });

  describe('Comparison Methods', () => {
    it('should correctly check if above limit', () => {
      const humidity = new Humidity(70);
      expect(humidity.isAbove(60)).toBe(true);
      expect(humidity.isAbove(80)).toBe(false);
    });

    it('should correctly check if below limit', () => {
      const humidity = new Humidity(40);
      expect(humidity.isBelow(50)).toBe(true);
      expect(humidity.isBelow(30)).toBe(false);
    });

    it('should return false when equal to limit in isAbove', () => {
      const humidity = new Humidity(60);
      expect(humidity.isAbove(60)).toBe(false);
    });

    it('should return false when equal to limit in isBelow', () => {
      const humidity = new Humidity(60);
      expect(humidity.isBelow(60)).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should convert to string with percentage symbol', () => {
      const humidity = new Humidity(65.5);
      expect(humidity.toString()).toBe('65.5%');
    });

    it('should handle zero humidity in string', () => {
      const humidity = new Humidity(0);
      expect(humidity.toString()).toBe('0%');
    });

    it('should handle 100% humidity in string', () => {
      const humidity = new Humidity(100);
      expect(humidity.toString()).toBe('100%');
    });
  });
});
