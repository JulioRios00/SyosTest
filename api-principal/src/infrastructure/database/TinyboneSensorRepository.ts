// Sensor Repository implementation using PostgreSQL
// Note: TinyBone is for client-side rendering, not database operations

import { Pool } from 'pg';
import { Sensor, SensorProps } from '../../domain/entities/Sensor';
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { DatabaseConnection } from '../config/database';

export class TinyboneSensorRepository implements ISensorRepository {
  private pool: Pool;

  constructor() {
    this.pool = DatabaseConnection.getInstance();
  }

  async save(sensor: Sensor): Promise<Sensor> {
    const sensorData = sensor.toJSON();
    
    const query = `
      INSERT INTO sensors (name, location, min_temperature, max_temperature, min_humidity, max_humidity, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      sensorData.name,
      sensorData.location,
      sensorData.limits.minTemperature,
      sensorData.limits.maxTemperature,
      sensorData.limits.minHumidity,
      sensorData.limits.maxHumidity,
      sensorData.isActive,
    ];

    const result = await this.pool.query(query, values);
    return this.mapToDomain(result.rows[0]);
  }

  async findById(id: string): Promise<Sensor | null> {
    const query = 'SELECT * FROM sensors WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToDomain(result.rows[0]);
  }

  async findAll(): Promise<Sensor[]> {
    const query = 'SELECT * FROM sensors ORDER BY created_at DESC';
    const result = await this.pool.query(query);
    
    return result.rows.map((row: any) => this.mapToDomain(row));
  }

  async findAllActive(): Promise<Sensor[]> {
    const query = 'SELECT * FROM sensors WHERE is_active = true ORDER BY created_at DESC';
    const result = await this.pool.query(query);
    
    return result.rows.map((row: any) => this.mapToDomain(row));
  }

  async update(sensor: Sensor): Promise<Sensor> {
    const sensorData = sensor.toJSON();
    
    const query = `
      UPDATE sensors 
      SET name = $1, location = $2, min_temperature = $3, max_temperature = $4,
          min_humidity = $5, max_humidity = $6, is_active = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      sensorData.name,
      sensorData.location,
      sensorData.limits.minTemperature,
      sensorData.limits.maxTemperature,
      sensorData.limits.minHumidity,
      sensorData.limits.maxHumidity,
      sensorData.isActive,
      sensorData.id,
    ];

    const result = await this.pool.query(query, values);
    return this.mapToDomain(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM sensors WHERE id = $1';
    await this.pool.query(query, [id]);
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
