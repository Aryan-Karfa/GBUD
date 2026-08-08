"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.hashRefreshToken = hashRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const config_1 = require("../config");
function signAccessToken(payload) {
    const jwtPayload = {
        sub: payload.id,
        email: payload.email,
        username: payload.username,
    };
    return jsonwebtoken_1.default.sign(jwtPayload, config_1.appConfig.jwt.accessSecret, {
        expiresIn: config_1.appConfig.jwt.accessExpiresIn,
    });
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, config_1.appConfig.jwt.accessSecret);
    }
    catch (_error) {
        throw new Error('Invalid or expired access token');
    }
}
function generateRefreshToken() {
    return (0, crypto_1.randomBytes)(32).toString('hex');
}
function hashRefreshToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
//# sourceMappingURL=jwt.js.map