
import TinyBone from 'tinybone';
import { Pool } from 'pg';
import { Alert, AlertProps, AlertType, AlertSeverity } from '../../domain/entities/Alert';
import { IAlertRepository } from '../../domain/ports/IAlertRepository';
import { DatabaseConnection } from '../config/database';

export class TinyboneAlertRepository implements IAlertRepository {
  private model: any;

  constructor() {
    const pool = DatabaseConnection.getInstance();
    
    this.model = new TinyBone(pool, {
      table: 'alerts',
      key: 'id',
      fields: [
        'id',
        'sensor_id',
        'type',
        'severity',
        'temperature',
        'humidity',
        'message',
        'created_at',
      ],
    });
  }

  async save(alert: Alert): Promise<Alert> {
    const alertData = alert.toJSON();
    
    const data = {
      sensor_id: alertData.sensorId,
      type: alertData.type,
      severity: alertData.severity,
      temperature: alertData.temperature,
      humidity: alertData.humidity,
      message: alertData.message,
    };

    const result = await this.model.insert(data);
    
    return this.mapToDomain(result);
  }

  async findById(id: string): Promise<Alert | null> {
    const result = await this.model.get(id);
    
    if (!result) {
      return null;
    }

    return this.mapToDomain(result);
  }

  async findAll(): Promise<Alert[]> {
    const results = await this.model.find({});
    
    return results.map((row: any) => this.mapToDomain(row));
  }

  async findBySensorId(sensorId: string): Promise<Alert[]> {
    const results = await this.model.find({ sensor_id: sensorId });
    
    return results.map((row: any) => this.mapToDomain(row));
  }

  async findRecent(limit: number): Promise<Alert[]> {
    const pool = DatabaseConnection.getInstance();
    
    const result = await pool.query(
      'SELECT * FROM alerts ORDER BY created_at DESC LIMIT $1',
      [limit]
    );

    return result.rows.map((row: any) => this.mapToDomain(row));
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
