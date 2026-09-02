import { HealthCheckStatus } from '@gbud/types';
export interface ReadinessCheckResult {
    status: 'ok' | 'degraded' | 'down';
    service: string;
    version: string;
    database: 'connected' | 'disconnected';
    timestamp: string;
}
export declare class HealthService {
    /**
     * Lightweight liveness check confirming the HTTP process is responsive.
     */
    getHealthStatus(): HealthCheckStatus;
    /**
     * Readiness probe verifying PostgreSQL database connectivity via Prisma.
     */
    getReadinessStatus(): Promise<{
        isReady: boolean;
        data: ReadinessCheckResult;
    }>;
}
export declare const healthService: HealthService;
//# sourceMappingURL=health.service.d.ts.map