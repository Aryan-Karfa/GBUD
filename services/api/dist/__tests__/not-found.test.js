"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
(0, vitest_1.describe)('Unmapped routes (404 handling)', () => {
    const app = (0, app_1.createApp)();
    (0, vitest_1.it)('should return 404 with structured JSON error payload for undefined endpoints', async () => {
        const res = await (0, supertest_1.default)(app).get('/api/v1/does-not-exist');
        (0, vitest_1.expect)(res.status).toBe(404);
        (0, vitest_1.expect)(res.headers['x-request-id']).toBeDefined();
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('NOT_FOUND');
        (0, vitest_1.expect)(res.body.message).toContain('Cannot GET /api/v1/does-not-exist');
        (0, vitest_1.expect)(res.body.timestamp).toBeDefined();
    });
});
//# sourceMappingURL=not-found.test.js.map