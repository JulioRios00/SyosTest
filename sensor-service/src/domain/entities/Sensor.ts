

import { SensorLimits, SensorLimitsProps } from '../value-objects/SensorLimits';

export interface SensorProps {
  id?: string;
  name: string;
  location: string;
  limits: SensorLimitsProps;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Sensor {
  private readonly id?: string;
  private name: string;
  private location: string;
  private limits: SensorLimits;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: SensorProps) {
    this.id = props.id;
    this.name = props.name;
    this.location = props.location;
    this.limits = new SensorLimits(props.limits);
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Sensor name is required');
    }
    if (!this.location || this.location.trim().length === 0) {
      throw new Error('Sensor location is required');
    }
  }

  getId(): string | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getLocation(): string {
    return this.location;
  }

  getLimits(): SensorLimits {
    return this.limits;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Sensor name cannot be empty');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateLocation(location: string): void {
    if (!location || location.trim().length === 0) {
      throw new Error('Sensor location cannot be empty');
    }
    this.location = location;
    this.updatedAt = new Date();
  }

  updateLimits(limits: SensorLimitsProps): void {
    this.limits = new SensorLimits(limits);
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      limits: {
        minTemperature: this.limits.getMinTemperature(),
        maxTemperature: this.limits.getMaxTemperature(),
        minHumidity: this.limits.getMinHumidity(),
        maxHumidity: this.limits.getMaxHumidity(),
      },
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
