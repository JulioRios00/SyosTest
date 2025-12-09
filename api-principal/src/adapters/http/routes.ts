// TODO 6: Adapters Layer - HTTP Routes
// Express routes configuration

import { Router } from 'express';
import { SensorController } from './SensorController';
import { DashboardController } from './DashboardController';

export class Routes {
  private router: Router;

  constructor(
    private readonly sensorController: SensorController,
    private readonly dashboardController: DashboardController
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Dashboard routes
    this.router.get('/', (req, res, next) => this.dashboardController.show(req, res, next));
    this.router.get('/dashboard', (req, res, next) => this.dashboardController.show(req, res, next));
    this.router.get('/api/dashboard', (req, res, next) => this.dashboardController.getData(req, res, next));

    // Sensor routes
    this.router.post('/api/sensors', (req, res, next) => this.sensorController.register(req, res, next));
    this.router.get('/api/sensors', (req, res, next) => this.sensorController.getAll(req, res, next));
    this.router.get('/api/sensors/active', (req, res, next) => this.sensorController.getActive(req, res, next));

    // Health check
    this.router.get('/health', (req, res) => {
      res.status(200).json({ status: 'healthy', service: 'api-principal' });
    });
  }

  getRouter(): Router {
    return this.router;
  }
}
