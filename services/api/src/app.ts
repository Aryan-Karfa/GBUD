import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { appConfig } from './config';
import apiRouter from './routes';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { errorMiddleware } from './middleware/error.middleware';

export function createApp(): Express {
  const app = express();

  // Security & Core Middlewares
  app.use(helmet());
  app.use(cors(appConfig.cors));
  app.use(express.json({ limit: appConfig.bodyLimit }));

  // Custom Request Correlation & Logging
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);

  // Mount API V1 routes
  app.use(appConfig.apiVersion, apiRouter);

  // 404 Unmapped Route Handler
  app.use(notFoundMiddleware);

  // Centralized Error Handling Middleware
  app.use(errorMiddleware);

  return app;
}
