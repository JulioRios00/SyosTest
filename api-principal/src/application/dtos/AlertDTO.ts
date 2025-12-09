
import { AlertType, AlertSeverity } from '../../domain/entities/Alert';

export interface AlertResponseDTO {
  id: string;
  sensorId: string;
  sensorName?: string;
  type: AlertType;
  severity: AlertSeverity;
  temperature: number;
  humidity: number;
  message: string;
  createdAt: Date;
}

export interface DashboardDataDTO {
  sensors: Array<{
    id: string;
    name: string;
    location: string;
    isActive: boolean;
    lastReading?: {
      temperature: number;
      humidity: number;
      timestamp: Date;
    };
  }>;
  recentAlerts: AlertResponseDTO[];
  statistics: {
    totalSensors: number;
    activeSensors: number;
    totalAlerts: number;
  };
}
