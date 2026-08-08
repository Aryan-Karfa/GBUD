"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.loadEnv = loadEnv;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../../.env') });
function loadEnv() {
    const rawNodeEnv = process.env.NODE_ENV || 'development';
    const nodeEnv = (['development', 'production', 'test'].includes(rawNodeEnv)
        ? rawNodeEnv
        : 'development');
    const rawPort = process.env.API_PORT || '4000';
    const port = parseInt(rawPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid API_PORT specified in environment: "${rawPort}"`);
    }
    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET ||
        (nodeEnv === 'production'
            ? (() => {
                throw new Error('JWT_ACCESS_SECRET must be defined in production environment');
            })()
            : 'gbud_dev_jwt_access_secret_min_32_characters_long');
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET ||
        (nodeEnv === 'production'
            ? (() => {
                throw new Error('JWT_REFRESH_SECRET must be defined in production environment');
            })()
            : 'gbud_dev_jwt_refresh_secret_min_32_characters_long');
    return {
        nodeEnv,
        port,
        corsOrigin: process.env.CORS_ORIGIN,
        apiVersion: '/api/v1',
        jwtAccessSecret,
        jwtRefreshSecret,
        jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    };
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map