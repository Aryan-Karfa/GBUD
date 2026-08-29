import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../client/http-client';
import { ApiError } from '../errors/api-error';

describe('Automatic Token Refresh Flow', () => {
  const baseUrl = 'http://localhost:4000';
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it('should intercept 401, refresh token, and retry the original request successfully', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(async (url: string, init: any) => {
      callCount++;
      if (url.includes('/workout-sessions') && callCount === 1) {
        // First request with expired token -> 401
        return {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers({ 'x-request-id': 'req-expired' }),
          text: async () =>
            JSON.stringify({
              success: false,
              message: 'Token expired',
              error: { code: 'UNAUTHORIZED' },
            }),
        };
      }

      if (url.includes('/auth/refresh')) {
        // Refresh request -> returns new tokens
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                user: { id: 'usr-1' },
                tokens: { accessToken: 'new-shiny-access-token', refreshToken: 'new-refresh-token' },
              },
            }),
        };
      }

      if (url.includes('/workout-sessions') && callCount === 3) {
        // Retried request with new token -> 200 OK
        expect(init.headers.Authorization).toBe('Bearer new-shiny-access-token');
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'x-request-id': 'req-retry-success' }),
          text: async () =>
            JSON.stringify({
              success: true,
              data: [{ id: 'session-1', status: 'COMPLETED' }],
            }),
        };
      }

      throw new Error(`Unexpected fetch call to ${url}`);
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    await client.tokenManager.setAccessToken('expired-access-token');
    await client.tokenManager.setRefreshToken('valid-refresh-token');

    // Register refresh handler
    client.setRefreshHandler(async () => {
      const storedRefresh = await client.tokenManager.getRefreshToken();
      const res = await client.post<any>('/api/v1/auth/refresh', { refreshToken: storedRefresh }, { skipAuth: true });
      await client.tokenManager.setAccessToken(res.tokens.accessToken);
      return res.tokens.accessToken;
    });

    const result = await client.get('/api/v1/workout-sessions');

    expect(result).toEqual([{ id: 'session-1', status: 'COMPLETED' }]);
    expect(callCount).toBe(3); // 1. Failed request -> 2. Refresh -> 3. Retried request
    expect(await client.tokenManager.getAccessToken()).toBe('new-shiny-access-token');
  });

  it('should clear tokens and throw ApiError when refresh fails', async () => {
    const onUnauthorizedSpy = vi.fn();

    // First request -> 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers(),
      text: async () => JSON.stringify({ success: false, message: 'Invalid token' }),
    });

    const client = new HttpClient({
      baseUrl,
      fetch: mockFetch as any,
      onUnauthorized: onUnauthorizedSpy,
    });
    await client.tokenManager.setAccessToken('bad-token');

    // Refresh handler rejects
    client.setRefreshHandler(async () => {
      throw new Error('Refresh token revoked');
    });

    await expect(client.get('/api/v1/train/exercises')).rejects.toThrow(ApiError);

    // Session must be cleared
    expect(await client.tokenManager.getAccessToken()).toBeNull();
    expect(onUnauthorizedSpy).toHaveBeenCalled();
  });

  it('should never retry more than once on recurring 401', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(async () => {
      callCount++;
      return {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers(),
        text: async () => JSON.stringify({ success: false, message: 'Unauthorized' }),
      };
    });

    const client = new HttpClient({ baseUrl, fetch: mockFetch as any });
    client.setRefreshHandler(async () => 'some-token');

    await expect(client.get('/api/v1/protected')).rejects.toThrow(ApiError);

    // 1 original request + 1 retried request = 2 max calls to protected endpoint
    expect(callCount).toBe(2);
  });
});
