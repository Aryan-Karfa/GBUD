import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export interface Environment {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  corsOrigin?: string;
  apiVersion: string;
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

  return {
    nodeEnv,
    port,
    corsOrigin: process.env.CORS_ORIGIN,
    apiVersion: '/api/v1',
  };
}

export const env = loadEnv();
