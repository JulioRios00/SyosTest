// Dashboard Controller with TinyBone integration
import { Request, Response, NextFunction } from 'express';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase';
import path from 'path';

export class DashboardController {
  constructor(private readonly getDashboardDataUseCase: GetDashboardDataUseCase) {}

  // Serve the main TinyBone dashboard HTML
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Send the base HTML that bootstraps TinyBone client-side application
      res.sendFile(path.join(__dirname, '../../../public/index.html'));
    } catch (error) {
      next(error);
    }
  }

  // API endpoint for dashboard data (consumed by TinyBone views)
  async getData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboardData = await this.getDashboardDataUseCase.execute();
      
      res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  }
}
