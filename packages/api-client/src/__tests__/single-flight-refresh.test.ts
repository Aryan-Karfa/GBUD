import { describe, it, expect, vi } from 'vitest';
import { HttpClient } from '../client/http-client';

describe('Single-Flight Refresh Locking Under High Concurrency', () => {
  const baseUrl = 'http://localhost:4000';

  it('should handle 5 simultaneous 401 requests with exactly ONE refresh call', async () => {
    let refreshCallsCount = 0;
    let endpointCallsCount = 0;
    let currentToken = 'expired-token';

    const mockFetch = vi.fn(async (url: string, init: any) => {
      if (url.includes('/auth/refresh')) {
        refreshCallsCount++;
        // Simulate refresh processing delay
        await new Promise((resolve) => setTimeout(resolve, 25));
        currentToken = 'fresh-new-token';
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                user: { id: 'usr-1' },
                tokens: { accessToken: currentToken, refreshToken: 'new-refresh-token' },
              },
            }),
        };
      }

      endpointCallsCount++;
      const authHeader = init.headers?.Authorization;

      if (authHeader === 'Bearer expired-token') {
        return {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers({ 'x-request-id': `req-401-${endpointCallsCount}` }),
          text: async () =>
            JSON.stringify({
              success: false,
              message: 'Access token expired',
              error: { code: 'UNAUTHORIZED' },
            }),
        };
      }

      if (authHeader === 'Bearer fresh-new-token') {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'x-request-id': `req-200-${endpointCallsCount}` }),
          text: async () =>
            JSON.stringify({
              success: true,
              data: { endpoint: url, result: 'success' },
            }),
        };
      }

      throw new Error(`Unexpected auth header: ${authHeader}`);
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    await client.tokenManager.setAccessToken(currentToken);
    await client.tokenManager.setRefreshToken('refresh-token-1');

    client.setRefreshHandler(async () => {
      const stored = await client.tokenManager.getRefreshToken();
      const res = await client.post<any>('/api/v1/auth/refresh', { refreshToken: stored }, { skipAuth: true });
      await client.tokenManager.setAccessToken(res.tokens.accessToken);
      return res.tokens.accessToken;
    });

    // Fire 5 requests simultaneously
    const [res1, res2, res3, res4, res5] = await Promise.all([
      client.get('/api/v1/exercises/1'),
      client.get('/api/v1/workout-templates/1'),
      client.get('/api/v1/workout-sessions/active'),
      client.get('/api/v1/progress/summary'),
      client.get('/api/v1/fuel/summary'),
    ]);

    // All 5 requests succeed
    expect(res1).toEqual({ endpoint: 'http://localhost:4000/api/v1/exercises/1', result: 'success' });
    expect(res2).toEqual({ endpoint: 'http://localhost:4000/api/v1/workout-templates/1', result: 'success' });
    expect(res3).toEqual({ endpoint: 'http://localhost:4000/api/v1/workout-sessions/active', result: 'success' });
    expect(res4).toEqual({ endpoint: 'http://localhost:4000/api/v1/progress/summary', result: 'success' });
    expect(res5).toEqual({ endpoint: 'http://localhost:4000/api/v1/fuel/summary', result: 'success' });

    // CRITICAL: Exactly ONE refresh call was made despite 5 concurrent 401s!
    expect(refreshCallsCount).toBe(1);

    // Initial 5 failed requests + 1 refresh request + 5 retried requests = 11 total fetch calls
    expect(mockFetch).toHaveBeenCalledTimes(11);
  });
});
