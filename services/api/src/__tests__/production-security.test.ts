import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import { createRateLimiter } from '../middleware/rate-limit.middleware';
import { errorMiddleware } from '../middleware/error.middleware';
import { healthService } from '../services/health.service';
import { prisma } from '../config/prisma';
import { appConfig } from '../config';
import { createApp } from '../app';

describe('Phase 14 Production Security & Reliability Hardening', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rate Limiting & Abuse Prevention', () => {
    it('should return 429 TOO_MANY_REQUESTS when limit is exceeded', async () => {
      const app = express();
      const testLimiter = createRateLimiter({
        windowMs: 60000,
        max: 2,
        message: 'Rate limit exceeded for testing',
      });

      app.use('/test-rate-limit', testLimiter, (_req: Request, res: Response) => {
        res.status(200).json({ success: true, message: 'OK' });
      });

      // Request 1: OK
      const res1 = await request(app).get('/test-rate-limit');
      expect(res1.status).toBe(200);

      // Request 2: OK
      const res2 = await request(app).get('/test-rate-limit');
      expect(res2.status).toBe(200);

      // Request 3: Rate limited
      const res3 = await request(app).get('/test-rate-limit');
      expect(res3.status).toBe(429);
      expect(res3.body.success).toBe(false);
      expect(res3.body.error.code).toBe('TOO_MANY_REQUESTS');
      expect(res3.body.message).toBe('Rate limit exceeded for testing');
      expect(res3.body).toHaveProperty('timestamp');
    });
  });

  describe('Database Readiness Probe (/api/v1/health/ready)', () => {
    it('should return 200 OK and database connected when Prisma query succeeds', async () => {
      vi.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([{ 1: 1 }] as any);

      const readiness = await healthService.getReadinessStatus();
      expect(readiness.isReady).toBe(true);
      expect(readiness.data.status).toBe('ok');
      expect(readiness.data.database).toBe('connected');
    });

    it('should return 503 and database disconnected when Prisma query fails', async () => {
      vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Connection terminated'));

      const readiness = await healthService.getReadinessStatus();
      expect(readiness.isReady).toBe(false);
      expect(readiness.data.status).toBe('down');
      expect(readiness.data.database).toBe('disconnected');
    });

    it('should serve /api/v1/health/ready through express router', async () => {
      vi.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([{ 1: 1 }] as any);

      const app = createApp();
      const res = await request(app).get('/api/v1/health/ready');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.database).toBe('connected');
    });
  });

  describe('Production Error Masking & Information Leak Protection', () => {
    it('should never leak internal database errors or SQL details in production', async () => {
      const originalEnv = appConfig.env;
      (appConfig as any).env = 'production';

      const app = express();
      app.get('/crash-test', (_req, _res, next) => {
        next(new Error('SELECT * FROM users WHERE password_hash = "secret_123"; connection timeout'));
      });
      app.use(errorMiddleware);

      const res = await request(app).get('/crash-test');

      (appConfig as any).env = originalEnv;

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Internal server error');
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(res.body.error.details).toBeNull();
      expect(JSON.stringify(res.body)).not.toContain('password_hash');
      expect(JSON.stringify(res.body)).not.toContain('SELECT');
    });
  });

  describe('Security Headers (Helmet)', () => {
    it('should set essential security headers (nosniff, frameguard)', async () => {
      const app = createApp();
      const res = await request(app).get('/api/v1/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });
  });
});
