
const TinyBone = require('../../../../../shared/tinybone/base');
import { Pool } from 'pg';
import { Sensor, SensorProps } from '../../domain/entities/Sensor';
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { DatabaseConnection } from '../config/database';

export class TinyboneSensorRepository implements ISensorRepository {
  private model: any;

  constructor() {
    const pool = DatabaseConnection.getInstance();
    
    // Initialize TinyBone model for sensors
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

  async save(sensor: Sensor): Promise<Sensor> {
    const sensorData = sensor.toJSON();
    
    const data = {
      name: sensorData.name,
      location: sensorData.location,
      min_temperature: sensorData.limits.minTemperature,
      max_temperature: sensorData.limits.maxTemperature,
      min_humidity: sensorData.limits.minHumidity,
      max_humidity: sensorData.limits.maxHumidity,
      is_active: sensorData.isActive,
    };

    const result = await this.model.insert(data);
    
    return this.mapToDomain(result);
  }

  async findById(id: string): Promise<Sensor | null> {
    const result = await this.model.get(id);
    
    if (!result) {
      return null;
    }

    return this.mapToDomain(result);
  }

  async findAll(): Promise<Sensor[]> {
    const results = await this.model.find({});
    
    return results.map((row: any) => this.mapToDomain(row));
  }

  async findByActive(isActive: boolean): Promise<Sensor[]> {
    const results = await this.model.find({ is_active: isActive });
    
    return results.map((row: any) => this.mapToDomain(row));
  }

  async update(id: string, sensor: Sensor): Promise<Sensor> {
    const sensorData = sensor.toJSON();
    
    const data = {
      name: sensorData.name,
      location: sensorData.location,
      min_temperature: sensorData.limits.minTemperature,
      max_temperature: sensorData.limits.maxTemperature,
      min_humidity: sensorData.limits.minHumidity,
      max_humidity: sensorData.limits.maxHumidity,
      is_active: sensorData.isActive,
      updated_at: new Date(),
    };

    await this.model.update(id, data);
    
    const updated = await this.model.get(id);
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.model.remove(id);
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
