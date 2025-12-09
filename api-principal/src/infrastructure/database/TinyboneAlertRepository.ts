// Alert Repository implementation using PostgreSQL
// Note: TinyBone is for client-side rendering, not database operations

import { Pool } from 'pg';
import { Alert, AlertProps, AlertType, AlertSeverity } from '../../domain/entities/Alert';
import { IAlertRepository } from '../../domain/ports/IAlertRepository';
import { DatabaseConnection } from '../config/database';

export class TinyboneAlertRepository implements IAlertRepository {
  private pool: Pool;

  constructor() {
    this.pool = DatabaseConnection.getInstance();
  }

  async save(alert: Alert): Promise<Alert> {
    const alertData = alert.toJSON();
    
    const query = `
      INSERT INTO alerts (sensor_id, type, severity, temperature, humidity, message)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      alertData.sensorId,
      alertData.type,
      alertData.severity,
      alertData.temperature,
      alertData.humidity,
      alertData.message,
    ];

    const result = await this.pool.query(query, values);
    return this.mapToDomain(result.rows[0]);
  }

  async findById(id: string): Promise<Alert | null> {
    const query = 'SELECT * FROM alerts WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToDomain(result.rows[0]);
  }

  async findAll(): Promise<Alert[]> {
    const query = 'SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100';
    const result = await this.pool.query(query);
    
    return result.rows.map((row: any) => this.mapToDomain(row));
  }

  async findBySensorId(sensorId: string): Promise<Alert[]> {
    const query = 'SELECT * FROM alerts WHERE sensor_id = $1 ORDER BY created_at DESC';
    const result = await this.pool.query(query, [sensorId]);
    
    return result.rows.map((row: any) => this.mapToDomain(row));
  }

  async findRecent(limit: number): Promise<Alert[]> {
    const query = 'SELECT * FROM alerts ORDER BY created_at DESC LIMIT $1';
    const result = await this.pool.query(query, [limit]);
    
    return result.rows.map((row: any) => this.mapToDomain(row));
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM alerts WHERE id = $1';
    await this.pool.query(query, [id]);
  }

  private mapToDomain(row: any): Alert {
    const props: AlertProps = {
      id: row.id,
      sensorId: row.sensor_id,
      type: row.type as AlertType,
      severity: row.severity as AlertSeverity,
      temperature: parseFloat(row.temperature),
      humidity: parseFloat(row.humidity),
      message: row.message,
      createdAt: row.created_at,
    };

    return new Alert(props);
  }
}
