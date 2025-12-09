export class Humidity {
  private readonly value: number;

  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Humidity must be between 0 and 100');
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
    return `${this.value}%`;
  }
}
