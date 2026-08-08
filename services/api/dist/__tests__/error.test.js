"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const error_middleware_1 = require("../middleware/error.middleware");
const app_error_1 = require("../utils/app-error");
const config_1 = require("../config");
(0, vitest_1.describe)('Error Handling Middleware', () => {
    (0, vitest_1.it)('should format custom AppError cleanly', async () => {
        const app = (0, express_1.default)();
        app.get('/test-bad-request', (_req, _res, next) => {
            next(app_error_1.AppError.badRequest('Custom bad request', [{ field: 'name', message: 'Required' }]));
        });
        app.use(error_middleware_1.errorMiddleware);
        const res = await (0, supertest_1.default)(app).get('/test-bad-request');
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('BAD_REQUEST');
        (0, vitest_1.expect)(res.body.error.details).toEqual([{ field: 'name', message: 'Required' }]);
    });
    (0, vitest_1.it)('should sanitize 500 internal errors in production mode (no stack trace or internal message leak)', async () => {
        const originalEnv = config_1.appConfig.env;
        config_1.appConfig.env = 'production';
        const app = (0, express_1.default)();
        app.get('/test-500-error', (_req, _res, next) => {
            next(new Error('Internal database connection failed with password secret_pass_123'));
        });
        app.use(error_middleware_1.errorMiddleware);
        const res = await (0, supertest_1.default)(app).get('/test-500-error');
        config_1.appConfig.env = originalEnv;
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        (0, vitest_1.expect)(res.body.message).toBe('Internal server error');
        (0, vitest_1.expect)(res.body.error.details).toBeNull();
        (0, vitest_1.expect)(JSON.stringify(res.body)).not.toContain('secret_pass_123');
    });
});
//# sourceMappingURL=error.test.js.map