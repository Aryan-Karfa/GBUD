import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../client/http-client';
import { ApiError } from '../errors/api-error';

describe('HttpClient', () => {
  const baseUrl = 'http://localhost:4000';
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it('should execute GET request with headers and query parameters', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'x-request-id': 'req-123' }),
      text: async () =>
        JSON.stringify({
          success: true,
          data: [{ id: 'ex-1', name: 'Bench Press' }],
          timestamp: '2026-08-19T00:00:00.000Z',
        }),
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    const result = await client.get('/api/v1/exercises', {
      params: { search: 'bench', limit: 10 },
    });

    expect(result).toEqual([{ id: 'ex-1', name: 'Bench Press' }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe('http://localhost:4000/api/v1/exercises?search=bench&limit=10');
    expect(calledInit.method).toBe('GET');
    expect(calledInit.headers.Accept).toBe('application/json');
  });

  it('should execute POST request with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: new Headers({ 'x-request-id': 'req-post' }),
      text: async () =>
        JSON.stringify({
          success: true,
          data: { id: 'tpl-1', name: 'Leg Day' },
          timestamp: '2026-08-19T00:00:00.000Z',
        }),
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    const result = await client.post('/api/v1/workout-templates', { name: 'Leg Day' });

    expect(result).toEqual({ id: 'tpl-1', name: 'Leg Day' });
    const [, calledInit] = mockFetch.mock.calls[0];
    expect(calledInit.method).toBe('POST');
    expect(calledInit.headers['Content-Type']).toBe('application/json');
    expect(calledInit.body).toBe(JSON.stringify({ name: 'Leg Day' }));
  });

  it('should execute PATCH, PUT, and DELETE requests', async () => {
    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });

    // PATCH
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: { updated: true } }),
    });
    const patchRes = await client.patch('/api/v1/workout-templates/1', { name: 'New' });
    expect(patchRes).toEqual({ updated: true });
    expect(mockFetch.mock.calls[0][1].method).toBe('PATCH');

    // PUT
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: { put: true } }),
    });
    const putRes = await client.put('/api/v1/workout-templates/1/reorder', { exerciseIds: ['1'] });
    expect(putRes).toEqual({ put: true });
    expect(mockFetch.mock.calls[1][1].method).toBe('PUT');

    // DELETE
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: null }),
    });
    const delRes = await client.delete('/api/v1/workout-templates/1');
    expect(delRes).toBeNull();
    expect(mockFetch.mock.calls[2][1].method).toBe('DELETE');
  });

  it('should inject Authorization Bearer token when present', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: { user: 'me' } }),
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    await client.tokenManager.setAccessToken('my-secret-access-token');

    await client.get('/api/v1/auth/me');

    const [, calledInit] = mockFetch.mock.calls[0];
    expect(calledInit.headers.Authorization).toBe('Bearer my-secret-access-token');
  });

  it('should omit Authorization header when skipAuth is true', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: { public: true } }),
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    await client.tokenManager.setAccessToken('my-secret-access-token');

    await client.get('/api/v1/health', { skipAuth: true });

    const [, calledInit] = mockFetch.mock.calls[0];
    expect(calledInit.headers.Authorization).toBeUndefined();
  });

  it('should throw ApiError with request ID on 404 or 422 error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'x-request-id': 'req-not-found' }),
      text: async () =>
        JSON.stringify({
          success: false,
          message: 'Exercise not found',
          error: { code: 'NOT_FOUND', details: null },
          timestamp: '2026-08-19T00:00:00.000Z',
        }),
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });

    try {
      await client.get('/api/v1/exercises/invalid-id');
      expect.fail('Should have thrown ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.statusCode).toBe(404);
      expect(apiErr.code).toBe('NOT_FOUND');
      expect(apiErr.message).toBe('Exercise not found');
      expect(apiErr.requestId).toBe('req-not-found');
      expect(apiErr.isNotFound()).toBe(true);
    }
  });

  it('should handle timeout and convert to ApiError.fromTimeout', async () => {
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('The operation was aborted.');
            error.name = 'AbortError';
            reject(error);
          }, 50);
        })
    );

    const client = new HttpClient({ baseUrl, timeout: 20, fetch: mockFetch as any });

    await expect(client.get('/api/v1/long-request')).rejects.toThrow('Request timed out after 20ms');
  });

  it('should handle AbortSignal cancellation', async () => {
    const controller = new AbortController();

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('The user aborted a request.'));
          });
        })
    );

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });

    setTimeout(() => controller.abort(), 10);

    await expect(
      client.get('/api/v1/cancelable', { signal: controller.signal })
    ).rejects.toThrow('Request was cancelled');
  });
});
