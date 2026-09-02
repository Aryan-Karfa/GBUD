"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../../middleware/rate-limit.middleware");
const validation_1 = require("@gbud/validation");
const router = (0, express_1.Router)();
router.post('/register', rate_limit_middleware_1.authRateLimiter, (0, validation_middleware_1.validateRequest)({ body: validation_1.registerSchema }), auth_controller_1.authController.register);
router.post('/login', rate_limit_middleware_1.authRateLimiter, (0, validation_middleware_1.validateRequest)({ body: validation_1.loginSchema }), auth_controller_1.authController.login);
router.post('/refresh', rate_limit_middleware_1.authRateLimiter, (0, validation_middleware_1.validateRequest)({ body: validation_1.refreshSchema }), auth_controller_1.authController.refresh);
router.post('/logout', auth_controller_1.authController.logout);
// Protected routes
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.me);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map