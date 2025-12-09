// Unit tests for Temperature Value Object

import { Temperature } from '../../../src/domain/value-objects/Temperature';

describe('Temperature Value Object', () => {
  describe('Valid Temperatures', () => {
    it('should create temperature with valid value', () => {
      const temp = new Temperature(25);
      expect(temp.getValue()).toBe(25);
    });

    it('should accept zero degrees', () => {
      const temp = new Temperature(0);
      expect(temp.getValue()).toBe(0);
    });

    it('should accept negative temperatures', () => {
      const temp = new Temperature(-20);
      expect(temp.getValue()).toBe(-20);
    });

    it('should accept absolute zero (-273.15)', () => {
      const temp = new Temperature(-273.15);
      expect(temp.getValue()).toBe(-273.15);
    });

    it('should accept maximum value (200)', () => {
      const temp = new Temperature(200);
      expect(temp.getValue()).toBe(200);
    });
  });

  describe('Invalid Temperatures', () => {
    it('should throw error for temperature below absolute zero', () => {
      expect(() => new Temperature(-274)).toThrow('Temperature cannot be below absolute zero');
    });

    it('should throw error for temperature above maximum', () => {
      expect(() => new Temperature(201)).toThrow('Temperature exceeds maximum allowed value');
    });
  });

  describe('Comparison Methods', () => {
    it('should correctly check if above limit', () => {
      const temp = new Temperature(30);
      expect(temp.isAbove(25)).toBe(true);
      expect(temp.isAbove(35)).toBe(false);
    });

    it('should correctly check if below limit', () => {
      const temp = new Temperature(20);
      expect(temp.isBelow(25)).toBe(true);
      expect(temp.isBelow(15)).toBe(false);
    });

    it('should return false when equal to limit in isAbove', () => {
      const temp = new Temperature(25);
      expect(temp.isAbove(25)).toBe(false);
    });

    it('should return false when equal to limit in isBelow', () => {
      const temp = new Temperature(25);
      expect(temp.isBelow(25)).toBe(false);
    });
  });

  describe('String Representation', () => {
    it('should convert to string with celsius symbol', () => {
      const temp = new Temperature(25.5);
      expect(temp.toString()).toBe('25.5°C');
    });

    it('should handle negative temperatures in string', () => {
      const temp = new Temperature(-10);
      expect(temp.toString()).toBe('-10°C');
    });
  });

  describe('Value Object Immutability', () => {
    it('should not allow value modification', () => {
      const temp = new Temperature(25);
      expect(temp.getValue()).toBe(25);
      // Value is readonly, TypeScript prevents modification
    });
  });
});
