// TODO 2: Domain Layer - Value Objects
// Temperature Value Object with validation

export class Temperature {
  private readonly value: number;

  constructor(value: number) {
    if (value < -273.15) {
      throw new Error('Temperature cannot be below absolute zero');
    }
    if (value > 200) {
      throw new Error('Temperature exceeds maximum allowed value');
    }
    this.value = value;
  }

  getValue(): number {
    return this.value;
  }

  isAbove(limit: number): boolean {
    return this.value > limit;
  }

  isBelow(limit: number): boolean {
    return this.value < limit;
  }

  toString(): string {
    return `${this.value}°C`;
  }
}
