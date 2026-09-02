"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("@gbud/validation");
const utils_1 = require("@gbud/utils");
const router = (0, express_1.Router)();
router.get('/health', health_controller_1.healthController.checkHealth);
router.get('/health/ready', health_controller_1.healthController.checkReadiness);
// Phase 1 test route to verify Zod validation middleware contract (returns 422 VALIDATION_ERROR if invalid)
router.post('/test-validation', (0, validation_middleware_1.validateRequest)({ body: validation_1.testBodySchema }), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Validation passed successfully',
        data: { validated: true },
        timestamp: (0, utils_1.formatTimestamp)(),
    });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map