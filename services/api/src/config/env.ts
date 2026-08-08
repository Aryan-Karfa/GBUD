import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export interface Environment {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  corsOrigin?: string;
  apiVersion: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
}

export function loadEnv(): Environment {
  const rawNodeEnv = process.env.NODE_ENV || 'development';
  const nodeEnv = (['development', 'production', 'test'].includes(rawNodeEnv)
    ? rawNodeEnv
    : 'development') as Environment['nodeEnv'];

  const rawPort = process.env.API_PORT || '4000';
  const port = parseInt(rawPort, 10);

  if (isNaN(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid API_PORT specified in environment: "${rawPort}"`);
  }

  const jwtAccessSecret =
    process.env.JWT_ACCESS_SECRET ||
    (nodeEnv === 'production'
      ? (() => {
          throw new Error('JWT_ACCESS_SECRET must be defined in production environment');
        })()
      : 'gbud_dev_jwt_access_secret_min_32_characters_long');

  const jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET ||
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

export const env = loadEnv();
