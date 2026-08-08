"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const prisma_1 = require("./config/prisma");
const app = (0, app_1.createApp)();
const server = app.listen(config_1.appConfig.port, () => {
    console.log(`[GBUD API] Server running in ${config_1.appConfig.env} mode on port ${config_1.appConfig.port}`);
    console.log(`[GBUD API] Health endpoint available at http://localhost:${config_1.appConfig.port}${config_1.appConfig.apiVersion}/health`);
});
// Graceful shutdown handling owning server closure and database disconnection
async function handleShutdown(signal) {
    console.log(`[GBUD API] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
        console.log('[GBUD API] HTTP server closed cleanly. Disconnecting Prisma database...');
        try {
            await prisma_1.prisma.$disconnect();
            console.log('[GBUD API] Database disconnected cleanly. Process exiting.');
            process.exit(0);
        }
        catch (err) {
            console.error('[GBUD API] Error disconnecting database during shutdown:', err);
            process.exit(1);
        }
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