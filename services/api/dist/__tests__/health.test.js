"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
(0, vitest_1.describe)('GET /api/v1/health', () => {
    const app = (0, app_1.createApp)();
    (0, vitest_1.it)('should return 200 OK with health status and X-Request-ID header', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/v1/health');
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.headers['x-request-id']).toBeDefined();
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.status).toBe('ok');
        (0, vitest_1.expect)(res.body.data.service).toBe('GBUD');
        (0, vitest_1.expect)(res.body.timestamp).toBeDefined();
    });
});
//# sourceMappingURL=health.test.js.map