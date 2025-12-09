
export interface RegisterSensorDTO {
  name: string;
  location: string;
  limits: {
    minTemperature: number;
    maxTemperature: number;
    minHumidity: number;
    maxHumidity: number;
  };
}

export interface SensorResponseDTO {
  id: string;
  name: string;
  location: string;
  limits: {
    minTemperature: number;
    maxTemperature: number;
    minHumidity: number;
    maxHumidity: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSensorDTO {
  name?: string;
  location?: string;
  limits?: {
    minTemperature: number;
    maxTemperature: number;
    minHumidity: number;
    maxHumidity: number;
  };
  isActive?: boolean;
}
