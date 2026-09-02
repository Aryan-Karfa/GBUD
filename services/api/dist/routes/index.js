"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_routes_1 = __importDefault(require("./health.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const exercise_routes_1 = __importDefault(require("../modules/train/exercise/exercise.routes"));
const workout_template_routes_1 = __importDefault(require("../modules/train/workout-template/workout-template.routes"));
const workout_session_routes_1 = __importDefault(require("../modules/train/workout-session/workout-session.routes"));
const progress_routes_1 = __importDefault(require("../modules/progress/progress.routes"));
const fuel_routes_1 = __importDefault(require("../modules/fuel/fuel.routes"));
const router = (0, express_1.Router)();
router.use('/', health_routes_1.default);
router.use('/auth', auth_routes_1.default);
router.use('/exercises', exercise_routes_1.default);
router.use('/workout-templates', workout_template_routes_1.default);
router.use('/workout-sessions', workout_session_routes_1.default);
router.use('/progress', progress_routes_1.default);
router.use('/fuel', fuel_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map