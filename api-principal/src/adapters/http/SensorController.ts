
import { Request, Response, NextFunction } from 'express';
import { RegisterSensorUseCase } from '../../application/use-cases/RegisterSensorUseCase';
import { GetSensorsUseCase } from '../../application/use-cases/GetSensorsUseCase';

export class SensorController {
  constructor(
    private readonly registerSensorUseCase: RegisterSensorUseCase,
    private readonly getSensorsUseCase: GetSensorsUseCase
  ) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = {
        name: req.body.name,
        location: req.body.location,
        limits: {
          minTemperature: parseFloat(req.body.minTemperature),
          maxTemperature: parseFloat(req.body.maxTemperature),
          minHumidity: parseFloat(req.body.minHumidity),
          maxHumidity: parseFloat(req.body.maxHumidity),
        },
      };

      const sensor = await this.registerSensorUseCase.execute(dto);
      
      res.status(201).json({
        success: true,
        data: sensor,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sensors = await this.getSensorsUseCase.execute();
      
      res.status(200).json({
        success: true,
        data: sensors,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sensors = await this.getSensorsUseCase.executeActive();
      
      res.status(200).json({
        success: true,
        data: sensors,
      });
    } catch (error) {
      next(error);
    }
  }
}
