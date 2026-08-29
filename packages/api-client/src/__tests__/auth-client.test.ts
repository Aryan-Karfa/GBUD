import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../client/http-client';
import { AuthClient } from '../auth/auth-client';
import { AuthResponseData, UserDTO } from '@gbud/types';

describe('AuthClient', () => {
  const baseUrl = 'http://localhost:4000';
  let mockFetch: ReturnType<typeof vi.fn>;
  let http: HttpClient;
  let auth: AuthClient;

  beforeEach(() => {
    mockFetch = vi.fn();
    http = new HttpClient({ baseUrl, fetch: mockFetch as any });
    auth = new AuthClient(http);
  });

  it('should register a new user and store tokens', async () => {
    const mockAuthData: AuthResponseData = {
      user: {
        id: 'usr-1',
        email: 'test@example.com',
        username: 'testuser',
        status: 'ACTIVE',
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'access-reg-123',
        refreshToken: 'refresh-reg-123',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: mockAuthData }),
    });

    const result = await auth.register({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });

    expect(result).toEqual(mockAuthData);
    expect(await http.tokenManager.getAccessToken()).toBe('access-reg-123');
    expect(await http.tokenManager.getRefreshToken()).toBe('refresh-reg-123');

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/v1/auth/register');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });
  });

  it('should login an existing user and store tokens', async () => {
    const mockAuthData: AuthResponseData = {
      user: {
        id: 'usr-2',
        email: 'user@example.com',
        username: 'user2',
        status: 'ACTIVE',
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'access-login-123',
        refreshToken: 'refresh-login-123',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: mockAuthData }),
    });

    const result = await auth.login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockAuthData);
    expect(await http.tokenManager.getAccessToken()).toBe('access-login-123');
    expect(await http.tokenManager.getRefreshToken()).toBe('refresh-login-123');
  });

  it('should refresh tokens and update TokenManager', async () => {
    await http.tokenManager.setRefreshToken('old-refresh-token');

    const mockRefreshData: AuthResponseData = {
      user: {
        id: 'usr-2',
        email: 'user@example.com',
        username: 'user2',
        status: 'ACTIVE',
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: mockRefreshData }),
    });

    const result = await auth.refresh();

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(await http.tokenManager.getAccessToken()).toBe('new-access-token');
    expect(await http.tokenManager.getRefreshToken()).toBe('new-refresh-token');
  });

  it('should logout and clear TokenManager even on network error', async () => {
    await http.tokenManager.setAccessToken('access-active');
    await http.tokenManager.setRefreshToken('refresh-active');

    // Simulate network error during logout request
    mockFetch.mockRejectedValueOnce(new Error('Network disconnected'));

    await auth.logout();

    // Session is still guaranteed to be wiped locally
    expect(await http.tokenManager.getAccessToken()).toBeNull();
    expect(await http.tokenManager.getRefreshToken()).toBeNull();
  });

  it('should retrieve current user via /api/v1/auth/me', async () => {
    const mockUser: UserDTO = {
      id: 'usr-me',
      email: 'me@example.com',
      username: 'meuser',
      status: 'ACTIVE',
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: mockUser }),
    });

    const result = await auth.getCurrentUser();
    expect(result).toEqual(mockUser);
    expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:4000/api/v1/auth/me');
  });
});
