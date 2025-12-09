import { Alert, AlertType, AlertSeverity } from '../../domain/entities/Alert';
import { ISensorRepository } from '../../domain/ports/ISensorRepository';
import { IAlertRepository } from '../../domain/ports/IAlertRepository';
import { ILogger } from '../../domain/ports/ILogger';
import { SensorDataMessage } from '../../domain/ports/IMessageQueue';

export class ProcessAlertUseCase {
  constructor(
    private readonly sensorRepository: ISensorRepository,
    private readonly alertRepository: IAlertRepository,
    private readonly logger: ILogger
  ) {}

  async execute(sensorData: SensorDataMessage): Promise<void> {
    try {
      this.logger.info('Processing sensor data for alerts', {
        sensorId: sensorData.sensorId,
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
      });

      // Get sensor information
      const sensor = await this.sensorRepository.findById(sensorData.sensorId);
      
      if (!sensor) {
        this.logger.warn('Sensor not found', { sensorId: sensorData.sensorId });
        return;
      }

      if (!sensor.getIsActive()) {
        this.logger.info('Sensor is inactive, skipping alert processing', {
          sensorId: sensorData.sensorId,
        });
        return;
      }

      const limits = sensor.getLimits();
      const alerts: Alert[] = [];

      // Check temperature limits
      if (sensorData.temperature > limits.getMaxTemperature()) {
        const alert = new Alert({
          sensorId: sensorData.sensorId,
          type: AlertType.TEMPERATURE_HIGH,
          severity: this.calculateSeverity(
            sensorData.temperature,
            limits.getMaxTemperature(),
            5
          ),
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          message: `Temperature ${sensorData.temperature}°C exceeds maximum limit of ${limits.getMaxTemperature()}°C for sensor ${sensor.getName()}`,
        });
        alerts.push(alert);
      } else if (sensorData.temperature < limits.getMinTemperature()) {
        const alert = new Alert({
          sensorId: sensorData.sensorId,
          type: AlertType.TEMPERATURE_LOW,
          severity: this.calculateSeverity(
            limits.getMinTemperature(),
            sensorData.temperature,
            5
          ),
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          message: `Temperature ${sensorData.temperature}°C below minimum limit of ${limits.getMinTemperature()}°C for sensor ${sensor.getName()}`,
        });
        alerts.push(alert);
      }

      // Check humidity limits
      if (sensorData.humidity > limits.getMaxHumidity()) {
        const alert = new Alert({
          sensorId: sensorData.sensorId,
          type: AlertType.HUMIDITY_HIGH,
          severity: this.calculateSeverity(
            sensorData.humidity,
            limits.getMaxHumidity(),
            10
          ),
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          message: `Humidity ${sensorData.humidity}% exceeds maximum limit of ${limits.getMaxHumidity()}% for sensor ${sensor.getName()}`,
        });
        alerts.push(alert);
      } else if (sensorData.humidity < limits.getMinHumidity()) {
        const alert = new Alert({
          sensorId: sensorData.sensorId,
          type: AlertType.HUMIDITY_LOW,
          severity: this.calculateSeverity(
            limits.getMinHumidity(),
            sensorData.humidity,
            10
          ),
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          message: `Humidity ${sensorData.humidity}% below minimum limit of ${limits.getMinHumidity()}% for sensor ${sensor.getName()}`,
        });
        alerts.push(alert);
      }

      // Save alerts and log them
      for (const alert of alerts) {
        await this.alertRepository.save(alert);
        
        const alertData = alert.toJSON();
        this.logger.warn(`ALERT GENERATED: ${alertData.severity}`, {
          alertId: alertData.id,
          sensorId: alertData.sensorId,
          sensorName: sensor.getName(),
          type: alertData.type,
          message: alertData.message,
        });

      }

      if (alerts.length === 0) {
        this.logger.info('All readings within limits', {
          sensorId: sensorData.sensorId,
          sensorName: sensor.getName(),
        });
      }
    } catch (error) {
      this.logger.error('Failed to process alert', error as Error, { sensorData });
      throw error;
    }
  }

  private calculateSeverity(value: number, limit: number, criticalThreshold: number): AlertSeverity {
    const difference = Math.abs(value - limit);
    return difference >= criticalThreshold ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
  }
}
