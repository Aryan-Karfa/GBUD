"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details = null) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, details = null) {
        return new AppError(message, 400, 'BAD_REQUEST', details);
    }
    static unauthorized(message = 'Authentication failed') {
        return new AppError(message, 401, 'UNAUTHORIZED');
    }
    static notFound(message = 'Resource not found') {
        return new AppError(message, 404, 'NOT_FOUND');
    }
    static conflict(message = 'Conflict', details = null) {
        return new AppError(message, 409, 'CONFLICT', details);
    }
    static validationError(message = 'Validation failed', details = null) {
        return new AppError(message, 422, 'VALIDATION_ERROR', details);
    }
    static internal(message = 'Internal server error') {
        return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
    }
}
exports.AppError = AppError;
//# sourceMappingURL=app-error.js.map