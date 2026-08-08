"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const user_repository_1 = require("../repositories/user.repository");
const app_error_1 = require("../utils/app-error");
async function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(app_error_1.AppError.unauthorized('Authentication token missing or invalid'));
        }
        const token = authHeader.substring(7).trim();
        if (!token) {
            return next(app_error_1.AppError.unauthorized('Authentication token missing'));
        }
        let payload;
        try {
            payload = (0, jwt_1.verifyAccessToken)(token);
        }
        catch (_err) {
            return next(app_error_1.AppError.unauthorized('Invalid or expired authentication token'));
        }
        const user = await user_repository_1.userRepository.findById(payload.sub);
        if (!user || user.status !== 'ACTIVE') {
            return next(app_error_1.AppError.unauthorized('Authentication failed'));
        }
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
        next();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.middleware.js.map