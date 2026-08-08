import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../middleware/error.middleware';
import { AppError } from '../utils/app-error';
import { appConfig } from '../config';

describe('Error Handling Middleware', () => {
  it('should format custom AppError cleanly', async () => {
    const app: Express = express();
    app.get('/test-bad-request', (_req: Request, _res: Response, next: NextFunction) => {
      next(AppError.badRequest('Custom bad request', [{ field: 'name', message: 'Required' }]));
    });
    app.use(errorMiddleware as any);

    const res = await request(app).get('/test-bad-request');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.details).toEqual([{ field: 'name', message: 'Required' }]);
  });

  it('should sanitize 500 internal errors in production mode (no stack trace or internal message leak)', async () => {
    const originalEnv = appConfig.env;
    (appConfig as any).env = 'production';

    const app: Express = express();
    app.get('/test-500-error', (_req: Request, _res: Response, next: NextFunction) => {
      next(new Error('Internal database connection failed with password secret_pass_123'));
    });
    app.use(errorMiddleware as any);

    const res = await request(app).get('/test-500-error');

    (appConfig as any).env = originalEnv;

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(res.body.message).toBe('Internal server error');
    expect(res.body.error.details).toBeNull();
    expect(JSON.stringify(res.body)).not.toContain('secret_pass_123');
  });
});
