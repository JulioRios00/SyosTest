
export enum AlertType {
  TEMPERATURE_HIGH = 'TEMPERATURE_HIGH',
  TEMPERATURE_LOW = 'TEMPERATURE_LOW',
  HUMIDITY_HIGH = 'HUMIDITY_HIGH',
  HUMIDITY_LOW = 'HUMIDITY_LOW',
}

export enum AlertSeverity {
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export interface AlertProps {
  id?: string;
  sensorId: string;
  type: AlertType;
  severity: AlertSeverity;
  temperature: number;
  humidity: number;
  message: string;
  createdAt?: Date;
}

export class Alert {
  private readonly id?: string;
  private readonly sensorId: string;
  private readonly type: AlertType;
  private readonly severity: AlertSeverity;
  private readonly temperature: number;
  private readonly humidity: number;
  private readonly message: string;
  private readonly createdAt: Date;

  constructor(props: AlertProps) {
    this.id = props.id;
    this.sensorId = props.sensorId;
    this.type = props.type;
    this.severity = props.severity;
    this.temperature = props.temperature;
    this.humidity = props.humidity;
    this.message = props.message;
    this.createdAt = props.createdAt || new Date();

    this.validate();
  }

  private validate(): void {
    if (!this.sensorId) {
      throw new Error('Sensor ID is required');
    }
    if (!this.message || this.message.trim().length === 0) {
      throw new Error('Alert message is required');
    }
  }

  getId(): string | undefined {
    return this.id;
  }

  getSensorId(): string {
    return this.sensorId;
  }

  getType(): AlertType {
    return this.type;
  }

  getSeverity(): AlertSeverity {
    return this.severity;
  }

  getTemperature(): number {
    return this.temperature;
  }

  getHumidity(): number {
    return this.humidity;
  }

  getMessage(): string {
    return this.message;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      sensorId: this.sensorId,
      type: this.type,
      severity: this.severity,
      temperature: this.temperature,
      humidity: this.humidity,
      message: this.message,
      createdAt: this.createdAt,
    };
  }
}
