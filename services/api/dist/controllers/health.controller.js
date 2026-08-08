"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = exports.HealthController = void 0;
const health_service_1 = require("../services/health.service");
class HealthController {
    checkHealth = (_req, res) => {
        const healthStatus = health_service_1.healthService.getHealthStatus();
        res.status(200).json({
            success: true,
            message: 'GBUD API is running',
            data: healthStatus,
            timestamp: healthStatus.timestamp,
        });
    };
}
exports.HealthController = HealthController;
exports.healthController = new HealthController();
//# sourceMappingURL=health.controller.js.map