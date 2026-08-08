"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
function requestIdMiddleware(req, res, next) {
    const existingId = req.headers['x-request-id'];
    const requestId = (typeof existingId === 'string' && existingId.trim() !== '')
        ? existingId
        : (0, crypto_1.randomUUID)();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
}
//# sourceMappingURL=request-id.middleware.js.map