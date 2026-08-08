"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
(0, vitest_1.describe)('Validation Middleware (422 VALIDATION_ERROR)', () => {
    const app = (0, app_1.createApp)();
    (0, vitest_1.it)('should return 422 VALIDATION_ERROR when request payload is invalid', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/v1/test-validation')
            .send({ name: '', email: 'invalid-email' });
        (0, vitest_1.expect)(res.status).toBe(422);
        (0, vitest_1.expect)(res.body.success).toBe(false);
        (0, vitest_1.expect)(res.body.error.code).toBe('VALIDATION_ERROR');
        (0, vitest_1.expect)(res.body.message).toBe('Validation failed');
        (0, vitest_1.expect)(Array.isArray(res.body.error.details)).toBe(true);
        (0, vitest_1.expect)(res.body.error.details.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should return 200 OK when request payload passes validation', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/v1/test-validation')
            .send({ name: 'Valid User', email: 'user@example.com' });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.validated).toBe(true);
    });
});
//# sourceMappingURL=validation.test.js.map