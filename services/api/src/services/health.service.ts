import { HealthCheckStatus } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { APP_CONFIG } from '@gbud/config';
import { prisma } from '../config/prisma';
import { appConfig } from '../config';

export interface ReadinessCheckResult {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  database: 'connected' | 'disconnected';
  timestamp: string;
}

export class HealthService {
  /**
   * Lightweight liveness check confirming the HTTP process is responsive.
   */
  public getHealthStatus(): HealthCheckStatus {
    return {
      status: 'ok',
      service: APP_CONFIG.name,
      version: APP_CONFIG.version,
      timestamp: formatTimestamp(),
    };
  }

  /**
   * Readiness probe verifying PostgreSQL database connectivity via Prisma.
   */
  public async getReadinessStatus(): Promise<{
    isReady: boolean;
    data: ReadinessCheckResult;
  }> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        isReady: true,
        data: {
          status: 'ok',
          service: APP_CONFIG.name,
          version: APP_CONFIG.version,
          database: 'connected',
          timestamp: formatTimestamp(),
        },
      };
    } catch {
      return {
        isReady: false,
        data: {
          status: 'down',
          service: APP_CONFIG.name,
          version: APP_CONFIG.version,
          database: 'disconnected',
          timestamp: formatTimestamp(),
        },
      };
    }
  }
}

export const healthService = new HealthService();
