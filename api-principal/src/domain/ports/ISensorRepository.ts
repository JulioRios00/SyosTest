

import { Sensor } from '../entities/Sensor';

export interface ISensorRepository {
  save(sensor: Sensor): Promise<Sensor>;
  findById(id: string): Promise<Sensor | null>;
  findAll(): Promise<Sensor[]>;
  findByActive(isActive: boolean): Promise<Sensor[]>;
  update(id: string, sensor: Sensor): Promise<Sensor>;
  delete(id: string): Promise<void>;
}
