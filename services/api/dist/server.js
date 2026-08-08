"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const app = (0, app_1.createApp)();
const server = app.listen(config_1.appConfig.port, () => {
    console.log(`[GBUD API] Server running in ${config_1.appConfig.env} mode on port ${config_1.appConfig.port}`);
    console.log(`[GBUD API] Health endpoint available at http://localhost:${config_1.appConfig.port}${config_1.appConfig.apiVersion}/health`);
});
// Graceful shutdown handling
function handleShutdown(signal) {
    console.log(`[GBUD API] Received ${signal}. Initiating graceful shutdown...`);
    server.close(() => {
        console.log('[GBUD API] HTTP server closed cleanly. Process exiting.');
        process.exit(0);
    });
    // Force shutdown after 10 seconds if connections refuse to close
    setTimeout(() => {
        console.error('[GBUD API] Forced shutdown after timeout.');
        process.exit(1);
    }, 10000).unref();
}
process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
//# sourceMappingURL=server.js.map