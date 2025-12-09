// TODO 4: Domain Layer - Ports (Interfaces)
// Repository Port for Sensor in Sensor Service

import { Sensor } from '../entities/Sensor';

export interface ISensorRepository {
  findById(id: string): Promise<Sensor | null>;
  findByActive(isActive: boolean): Promise<Sensor[]>;
}
