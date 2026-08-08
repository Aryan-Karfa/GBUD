"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const app_error_1 = require("../utils/app-error");
const utils_1 = require("@gbud/utils");
const config_1 = require("../config");
function errorMiddleware(err, _req, res, _next) {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';
    let details = null;
    if (err instanceof app_error_1.AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;
        details = err.details;
    }
    else if (err && typeof err === 'object' && 'statusCode' in err) {
        statusCode = err.statusCode || 500;
        message = err.message || 'An unexpected error occurred';
    }
    // In production, mask unhandled 500 internal errors for security
    if (statusCode === 500 && config_1.appConfig.env === 'production') {
        message = 'Internal server error';
        details = null;
    }
    res.status(statusCode).json({
        success: false,
        message,
        error: {
            code,
            details,
        },
        timestamp: (0, utils_1.formatTimestamp)(),
    });
}
//# sourceMappingURL=error.middleware.js.map