// TODO 4: Infrastructure Layer - Database configuration
// PostgreSQL connection setup

import { Pool } from 'pg';

export class DatabaseConnection {
  private static instance: Pool;

  static getInstance(): Pool {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'sensor_monitoring',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
    return DatabaseConnection.instance;
  }

  static async close(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.end();
    }
  }

  static async initialize(): Promise<void> {
    const pool = DatabaseConnection.getInstance();
    
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
    } catch (error) {
      console.error('Database connection error:', error);
      console.error('Connection details:', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'sensor_monitoring',
        user: process.env.DB_USER || 'postgres'
      });
      console.error('\nPlease check:');
      console.error('1. PostgreSQL is running');
      console.error('2. Database exists');
      console.error('3. Password in .env file matches PostgreSQL password');
      console.error('4. User has access to the database');
      console.error('\nTo fix: Update DB_PASSWORD in api-principal/.env file with your PostgreSQL password');
      throw error;
      console.error('Failed to connect to database:', error);
      throw error;
    }

    // Create tables if they don't exist
    await DatabaseConnection.createTables();
  }

  private static async createTables(): Promise<void> {
    const pool = DatabaseConnection.getInstance();
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        min_temperature DECIMAL(5,2) NOT NULL,
        max_temperature DECIMAL(5,2) NOT NULL,
        min_humidity DECIMAL(5,2) NOT NULL,
        max_humidity DECIMAL(5,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        temperature DECIMAL(5,2) NOT NULL,
        humidity DECIMAL(5,2) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_alerts_sensor_id ON alerts(sensor_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
    `);

  }
}
