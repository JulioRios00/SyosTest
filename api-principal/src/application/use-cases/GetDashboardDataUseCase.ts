
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { IAlertRepository } from '../../domain/ports/IAlertRepository';
import { ILogger } from '../../domain/ports/ILogger';
import { DashboardDataDTO } from '../dtos/AlertDTO';

export class GetDashboardDataUseCase {
  constructor(
    private readonly sensorRepository: ISensorRepository,
    private readonly alertRepository: IAlertRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<DashboardDataDTO> {
    try {
      this.logger.info('Fetching dashboard data');

      // Fetch sensors and alerts in parallel
      const [sensors, recentAlerts] = await Promise.all([
        this.sensorRepository.findAll(),
        this.alertRepository.findRecent(10),
      ]);

      const activeSensors = sensors.filter(s => s.getIsActive());

      const dashboardData: DashboardDataDTO = {
        sensors: sensors.map(sensor => {
          const sensorData = sensor.toJSON();
          return {
            id: sensorData.id!,
            name: sensorData.name,
            location: sensorData.location,
            isActive: sensorData.isActive,
          };
        }),
        recentAlerts: recentAlerts.map(alert => {
          const alertData = alert.toJSON();
          // Find the sensor name for this alert
          const sensor = sensors.find(s => s.getId() === alertData.sensorId);
          const sensorName = sensor ? sensor.getName() : 'Unknown Sensor';
          
          return {
            id: alertData.id!,
            sensorId: alertData.sensorId,
            sensorName: sensorName,
            type: alertData.type,
            severity: alertData.severity,
            temperature: alertData.temperature,
            humidity: alertData.humidity,
            message: alertData.message,
            createdAt: alertData.createdAt,
          };
        }),
        statistics: {
          totalSensors: sensors.length,
          activeSensors: activeSensors.length,
          totalAlerts: recentAlerts.length,
        },
      };

      this.logger.info('Dashboard data fetched successfully', {
        sensorsCount: sensors.length,
        alertsCount: recentAlerts.length,
      });

      return dashboardData;
    } catch (error) {
      this.logger.error('Failed to fetch dashboard data', error as Error);
      throw error;
    }
  }
}
