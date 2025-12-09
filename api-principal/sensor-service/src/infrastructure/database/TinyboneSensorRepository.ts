
import TinyBone from 'tinybone';
import { Sensor, SensorProps } from '../../domain/entities/Sensor';
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { DatabaseConnection } from '../config/database';

export class TinyboneSensorRepository implements ISensorRepository {
  private model: any;

  constructor() {
    const pool = DatabaseConnection.getInstance();
    
    this.model = new TinyBone(pool, {
      table: 'sensors',
      key: 'id',
      fields: [
        'id',
        'name',
        'location',
        'min_temperature',
        'max_temperature',
        'min_humidity',
        'max_humidity',
        'is_active',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findById(id: string): Promise<Sensor | null> {
    const result = await this.model.get(id);
    
    if (!result) {
      return null;
    }

    return this.mapToDomain(result);
  }

  async findByActive(isActive: boolean): Promise<Sensor[]> {
    const results = await this.model.find({ is_active: isActive });
    
    return results.map((row: any) => this.mapToDomain(row));
  }

  private mapToDomain(row: any): Sensor {
    const props: SensorProps = {
      id: row.id,
      name: row.name,
      location: row.location,
      limits: {
        minTemperature: parseFloat(row.min_temperature),
        maxTemperature: parseFloat(row.max_temperature),
        minHumidity: parseFloat(row.min_humidity),
        maxHumidity: parseFloat(row.max_humidity),
      },
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return new Sensor(props);
  }
}
