"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = loggerMiddleware;
const config_1 = require("../config");
function loggerMiddleware(req, res, next) {
    if (config_1.appConfig.env === 'test') {
        return next();
    }
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] [${req.id || 'N/A'}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
}
//# sourceMappingURL=logger.middleware.js.map