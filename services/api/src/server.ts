import { createApp } from './app';
import { appConfig } from './config';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(appConfig.port, () => {
  console.log(`[GBUD API] Server running in ${appConfig.env} mode on port ${appConfig.port}`);
  console.log(`[GBUD API] Health endpoint available at http://localhost:${appConfig.port}${appConfig.apiVersion}/health`);
});

// Graceful shutdown handling owning server closure and database disconnection
async function handleShutdown(signal: string): Promise<void> {
  console.log(`[GBUD API] Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('[GBUD API] HTTP server closed cleanly. Disconnecting Prisma database...');
    try {
      await prisma.$disconnect();
      console.log('[GBUD API] Database disconnected cleanly. Process exiting.');
      process.exit(0);
    } catch (err) {
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
