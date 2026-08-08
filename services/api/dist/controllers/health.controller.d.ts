import { Request, Response } from 'express';
import { APIResponse, HealthCheckStatus } from '@gbud/types';
export declare class HealthController {
    checkHealth: (_req: Request, res: Response<APIResponse<HealthCheckStatus>>) => void;
}
export declare const healthController: HealthController;
//# sourceMappingURL=health.controller.d.ts.map