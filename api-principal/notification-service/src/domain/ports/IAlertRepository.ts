// TODO 2: Domain Layer - Ports (Interfaces)
// Repository Port for Alert persistence

import { Alert } from '../entities/Alert';

export interface IAlertRepository {
  save(alert: Alert): Promise<Alert>;
  findById(id: string): Promise<Alert | null>;
  findAll(): Promise<Alert[]>;
  findBySensorId(sensorId: string): Promise<Alert[]>;
  findRecent(limit: number): Promise<Alert[]>;
}
