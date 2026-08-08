"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const env_1 = require("./env");
const config_1 = require("@gbud/config");
exports.appConfig = {
    name: config_1.APP_CONFIG.name,
    version: config_1.APP_CONFIG.version,
    env: env_1.env.nodeEnv,
    port: env_1.env.port,
    apiVersion: env_1.env.apiVersion,
    jwt: {
        accessSecret: env_1.env.jwtAccessSecret,
        refreshSecret: env_1.env.jwtRefreshSecret,
        accessExpiresIn: env_1.env.jwtAccessExpiresIn,
        refreshExpiresIn: env_1.env.jwtRefreshExpiresIn,
    },
    cors: {
        origin: env_1.env.corsOrigin ? env_1.env.corsOrigin.split(',').map((o) => o.trim()) : env_1.env.nodeEnv === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
    },
    bodyLimit: '1mb',
};
//# sourceMappingURL=app.config.js.map