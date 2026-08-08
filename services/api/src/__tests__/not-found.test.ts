import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Unmapped routes (404 handling)', () => {
  const app = createApp();

  it('should return 404 with structured JSON error payload for undefined endpoints', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.message).toContain('Cannot GET /api/v1/does-not-exist');
    expect(res.body.timestamp).toBeDefined();
  });
});
