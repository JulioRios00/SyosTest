
import { Sensor } from '../entities/Sensor';

export interface ISensorRepository {
  findById(id: string): Promise<Sensor | null>;
  findByActive(isActive: boolean): Promise<Sensor[]>;
}
