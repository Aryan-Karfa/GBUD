import { createApp } from './app';
import { appConfig } from './config';

const app = createApp();

const server = app.listen(appConfig.port, () => {
  console.log(`[GBUD API] Server running in ${appConfig.env} mode on port ${appConfig.port}`);
  console.log(`[GBUD API] Health endpoint available at http://localhost:${appConfig.port}${appConfig.apiVersion}/health`);
});

// Graceful shutdown handling
function handleShutdown(signal: string): void {
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
