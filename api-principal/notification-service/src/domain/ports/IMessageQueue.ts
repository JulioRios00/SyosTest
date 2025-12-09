// TODO 2: Domain Layer - Ports (Interfaces)
// Message Queue Port for publishing sensor data

export interface SensorDataMessage {
  sensorId: string;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export interface IMessageQueue {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publish(queue: string, message: SensorDataMessage): Promise<void>;
  consume(queue: string, handler: (message: SensorDataMessage) => Promise<void>): Promise<void>;
}
