import { env } from './env';
import { APP_CONFIG } from '@gbud/config';

export const appConfig = {
  name: APP_CONFIG.name,
  version: APP_CONFIG.version,
  env: env.nodeEnv,
  port: env.port,
  apiVersion: env.apiVersion,
  cors: {
    origin: env.corsOrigin ? env.corsOrigin.split(',').map((o) => o.trim()) : env.nodeEnv === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
  bodyLimit: '1mb',
};
