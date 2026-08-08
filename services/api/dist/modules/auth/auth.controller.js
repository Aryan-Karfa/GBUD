"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const utils_1 = require("@gbud/utils");
const config_1 = require("../../config");
const app_error_1 = require("../../utils/app-error");
const COOKIE_NAME = 'refreshToken';
class AuthController {
    setRefreshCookie(res, token) {
        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: config_1.appConfig.env === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/v1/auth',
        });
    }
    clearRefreshCookie(res) {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure: config_1.appConfig.env === 'production',
            sameSite: 'lax',
            path: '/api/v1/auth',
        });
    }
    extractRefreshToken(req) {
        return req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
    }
    register = async (req, res, next) => {
        try {
            const result = await auth_service_1.authService.register(req.body);
            this.setRefreshCookie(res, result.tokens.refreshToken);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
                timestamp: (0, utils_1.formatTimestamp)(),
            });
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const result = await auth_service_1.authService.login(req.body);
            this.setRefreshCookie(res, result.tokens.refreshToken);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result,
                timestamp: (0, utils_1.formatTimestamp)(),
            });
        }
        catch (error) {
            next(error);
        }
    };
    refresh = async (req, res, next) => {
        try {
            const refreshToken = this.extractRefreshToken(req);
            if (!refreshToken) {
                return next(app_error_1.AppError.unauthorized('Refresh token missing'));
            }
            const result = await auth_service_1.authService.refreshToken(refreshToken);
            this.setRefreshCookie(res, result.tokens.refreshToken);
            res.status(200).json({
                success: true,
                message: 'Tokens refreshed successfully',
                data: result,
                timestamp: (0, utils_1.formatTimestamp)(),
            });
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const refreshToken = this.extractRefreshToken(req);
            if (refreshToken) {
                await auth_service_1.authService.logout(refreshToken);
            }
            this.clearRefreshCookie(res);
            res.status(200).json({
                success: true,
                message: 'Logout successful',
                data: null,
                timestamp: (0, utils_1.formatTimestamp)(),
            });
        }
        catch (error) {
            next(error);
        }
    };
    me = async (req, res, next) => {
        try {
            if (!req.user) {
                return next(app_error_1.AppError.unauthorized('Authentication required'));
            }
            const user = await auth_service_1.authService.getCurrentUser(req.user.id);
            res.status(200).json({
                success: true,
                message: 'Current user profile retrieved',
                data: user,
                timestamp: (0, utils_1.formatTimestamp)(),
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map