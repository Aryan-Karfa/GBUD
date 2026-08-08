"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthService = exports.HealthService = void 0;
const utils_1 = require("@gbud/utils");
const config_1 = require("@gbud/config");
class HealthService {
    getHealthStatus() {
        return {
            status: 'ok',
            service: config_1.APP_CONFIG.name,
            version: config_1.APP_CONFIG.version,
            timestamp: (0, utils_1.formatTimestamp)(),
        };
    }
}
exports.HealthService = HealthService;
exports.healthService = new HealthService();
//# sourceMappingURL=health.service.js.map