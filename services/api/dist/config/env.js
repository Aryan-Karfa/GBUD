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
    return {
        nodeEnv,
        port,
        corsOrigin: process.env.CORS_ORIGIN,
        apiVersion: '/api/v1',
    };
}
exports.env = loadEnv();
//# sourceMappingURL=env.js.map