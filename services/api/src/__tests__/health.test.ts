import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('GET /api/v1/health', () => {
  const app = createApp();

  it('should return 200 OK with health status and X-Request-ID header', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.service).toBe('GBUD');
    expect(res.body.timestamp).toBeDefined();
  });
});
