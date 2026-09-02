import { Request, Response } from 'express';
import { healthService } from '../services/health.service';
import { APIResponse, HealthCheckStatus } from '@gbud/types';

export class HealthController {
  public checkHealth = (_req: Request, res: Response<APIResponse<HealthCheckStatus>>): void => {
    const healthStatus = healthService.getHealthStatus();
    res.status(200).json({
      success: true,
      message: 'GBUD API is running',
      data: healthStatus,
      timestamp: healthStatus.timestamp,
    });
  };

  public checkReadiness = async (_req: Request, res: Response): Promise<void> => {
    const { isReady, data } = await healthService.getReadinessStatus();
    const statusCode = isReady ? 200 : 503;

    res.status(statusCode).json({
      success: isReady,
      message: isReady ? 'GBUD API and database are ready' : 'Database connection unavailable',
      data,
      timestamp: data.timestamp,
    });
  };
}

export const healthController = new HealthController();
