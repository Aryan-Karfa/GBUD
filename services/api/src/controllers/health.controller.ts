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
}

export const healthController = new HealthController();
