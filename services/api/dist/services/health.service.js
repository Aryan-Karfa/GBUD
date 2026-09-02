"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = exports.HealthService = void 0;
const utils_1 = require("@gbud/utils");
const config_1 = require("@gbud/config");
const prisma_1 = require("../config/prisma");
class HealthService {
    /**
     * Lightweight liveness check confirming the HTTP process is responsive.
     */
    getHealthStatus() {
        return {
            status: 'ok',
            service: config_1.APP_CONFIG.name,
            version: config_1.APP_CONFIG.version,
            timestamp: (0, utils_1.formatTimestamp)(),
        };
    }
    /**
     * Readiness probe verifying PostgreSQL database connectivity via Prisma.
     */
    async getReadinessStatus() {
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            return {
                isReady: true,
                data: {
                    status: 'ok',
                    service: config_1.APP_CONFIG.name,
                    version: config_1.APP_CONFIG.version,
                    database: 'connected',
                    timestamp: (0, utils_1.formatTimestamp)(),
                },
            };
        }
        catch {
            return {
                isReady: false,
                data: {
                    status: 'down',
                    service: config_1.APP_CONFIG.name,
                    version: config_1.APP_CONFIG.version,
                    database: 'disconnected',
                    timestamp: (0, utils_1.formatTimestamp)(),
                },
            };
        }
    }
}
exports.HealthService = HealthService;
exports.healthService = new HealthService();
//# sourceMappingURL=health.service.js.map