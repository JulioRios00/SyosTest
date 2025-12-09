export interface SensorLimitsProps {
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
}

export class SensorLimits {
  private readonly minTemperature: number;
  private readonly maxTemperature: number;
  private readonly minHumidity: number;
  private readonly maxHumidity: number;

  constructor(props: SensorLimitsProps) {
    if (props.minTemperature >= props.maxTemperature) {
      throw new Error('Min temperature must be less than max temperature');
    }
    if (props.minHumidity >= props.maxHumidity) {
      throw new Error('Min humidity must be less than max humidity');
    }
    if (props.minHumidity < 0 || props.maxHumidity > 100) {
      throw new Error('Humidity limits must be between 0 and 100');
    }

    this.minTemperature = props.minTemperature;
    this.maxTemperature = props.maxTemperature;
    this.minHumidity = props.minHumidity;
    this.maxHumidity = props.maxHumidity;
  }

  getMinTemperature(): number {
    return this.minTemperature;
  }

  getMaxTemperature(): number {
    return this.maxTemperature;
  }

  getMinHumidity(): number {
    return this.minHumidity;
  }

  getMaxHumidity(): number {
    return this.maxHumidity;
  }

  isTemperatureWithinLimits(temperature: number): boolean {
    return temperature >= this.minTemperature && temperature <= this.maxTemperature;
  }

  isHumidityWithinLimits(humidity: number): boolean {
    return humidity >= this.minHumidity && humidity <= this.maxHumidity;
  }
}
