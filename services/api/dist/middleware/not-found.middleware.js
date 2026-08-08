"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = notFoundMiddleware;
const app_error_1 = require("../utils/app-error");
function notFoundMiddleware(req, _res, next) {
    next(app_error_1.AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
}
//# sourceMappingURL=not-found.middleware.js.map