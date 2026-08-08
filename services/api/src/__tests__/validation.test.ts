import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('Validation Middleware (422 VALIDATION_ERROR)', () => {
  const app = createApp();

  it('should return 422 VALIDATION_ERROR when request payload is invalid', async () => {
    const res = await request(app)
      .post('/api/v1/test-validation')
      .send({ name: '', email: 'invalid-email' });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.message).toBe('Validation failed');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('should return 200 OK when request payload passes validation', async () => {
    const res = await request(app)
      .post('/api/v1/test-validation')
      .send({ name: 'Valid User', email: 'user@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.validated).toBe(true);
  });
});
