"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const routes_1 = __importDefault(require("./routes"));
const request_id_middleware_1 = require("./middleware/request-id.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
function createApp() {
    const app = (0, express_1.default)();
    // Security & Core Middlewares
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)(config_1.appConfig.cors));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: config_1.appConfig.bodyLimit }));
    // Custom Request Correlation & Logging
    app.use(request_id_middleware_1.requestIdMiddleware);
    app.use(logger_middleware_1.loggerMiddleware);
    // Mount API V1 routes
    app.use(config_1.appConfig.apiVersion, routes_1.default);
    // 404 Unmapped Route Handler
    app.use(not_found_middleware_1.notFoundMiddleware);
    // Centralized Error Handling Middleware
    app.use(error_middleware_1.errorMiddleware);
    return app;
}
//# sourceMappingURL=app.js.map