import { HealthCheckStatus } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { APP_CONFIG } from '@gbud/config';

export class HealthService {
  public getHealthStatus(): HealthCheckStatus {
    return {
      status: 'ok',
      service: APP_CONFIG.name,
      version: APP_CONFIG.version,
      timestamp: formatTimestamp(),
    };
  }
}

export const healthService = new HealthService();
