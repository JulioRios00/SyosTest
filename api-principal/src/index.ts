// TODO 7: Main application file for API Principal
// Dependency injection and server setup

import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Infrastructure
import { DatabaseConnection } from './infrastructure/config/database';
import { TinyboneSensorRepository } from './infrastructure/database/TinyboneSensorRepository';
import { TinyboneAlertRepository } from './infrastructure/database/TinyboneAlertRepository';
import { WinstonLogger } from './infrastructure/config/logger';

// Use Cases
import { RegisterSensorUseCase } from './application/use-cases/RegisterSensorUseCase';
import { GetSensorsUseCase } from './application/use-cases/GetSensorsUseCase';
import { GetDashboardDataUseCase } from './application/use-cases/GetDashboardDataUseCase';

// Adapters
import { SensorController } from './adapters/http/SensorController';
import { DashboardController } from './adapters/http/DashboardController';
import { Routes } from './adapters/http/routes';
import { ErrorMiddleware } from './adapters/http/ErrorMiddleware';

dotenv.config();

class ApiPrincipalApp {
  private app: Express;
  private logger: WinstonLogger;
  private port: number;

  constructor() {
    this.app = express();
    this.logger = new WinstonLogger('api-principal');
    this.port = parseInt(process.env.PORT || '3000');
    
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Serve static files for TinyBone client-side application
    this.app.use('/js', express.static(__dirname + '/../public/js'));
    this.app.use('/shared', express.static(__dirname + '/../../shared'));
    this.app.use(express.static(__dirname + '/../public'));
  }

  private setupRoutes(): void {
    // Dependency Injection - Infrastructure Layer
    const sensorRepository = new TinyboneSensorRepository();
    const alertRepository = new TinyboneAlertRepository();

    // Dependency Injection - Application Layer
    const registerSensorUseCase = new RegisterSensorUseCase(sensorRepository, this.logger);
    const getSensorsUseCase = new GetSensorsUseCase(sensorRepository, this.logger);
    const getDashboardDataUseCase = new GetDashboardDataUseCase(
      sensorRepository,
      alertRepository,
      this.logger
    );

    // Dependency Injection - Adapters Layer
    const sensorController = new SensorController(registerSensorUseCase, getSensorsUseCase);
    const dashboardController = new DashboardController(getDashboardDataUseCase);

    // Setup routes
    const routes = new Routes(sensorController, dashboardController);
    this.app.use('/', routes.getRouter());

    // Error handling middleware (must be last)
    const errorMiddleware = new ErrorMiddleware(this.logger);
    this.app.use((err: Error, req: any, res: any, next: any) => 
      errorMiddleware.handle(err, req, res, next)
    );
  }

  async start(): Promise<void> {
    try {
      // Initialize database
      await DatabaseConnection.initialize();
      this.logger.info('Database initialized successfully');

      // Setup routes
      this.setupRoutes();

      // Start server
      this.app.listen(this.port, () => {
        this.logger.info(`API Principal started on port ${this.port}`);
        this.logger.info(`Dashboard: http://localhost:${this.port}/dashboard`);
      });
    } catch (error) {
      this.logger.error('Failed to start API Principal', error as Error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      await DatabaseConnection.close();
      this.logger.info('API Principal stopped');
    } catch (error) {
      this.logger.error('Error stopping API Principal', error as Error);
    }
  }
}

// Start the application
const app = new ApiPrincipalApp();
app.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await app.stop();
  process.exit(0);
});

export default app;
