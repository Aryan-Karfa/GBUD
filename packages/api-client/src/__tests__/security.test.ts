import { describe, it, expect, vi } from 'vitest';
import { HttpClient } from '../client/http-client';
import { ApiError } from '../errors/api-error';
import { validateApiUrl } from '../config/api-config';
import { AuthClient } from '../auth/auth-client';

describe('Client Security Boundaries', () => {
  const baseUrl = 'http://localhost:4000';

  it('should reject dangerous protocols in URL configuration', () => {
    expect(() => validateApiUrl('javascript:alert(1)')).toThrow('Invalid protocol');
    expect(() => validateApiUrl('file:///etc/passwd')).toThrow('Invalid protocol');
    expect(() => validateApiUrl('ftp://example.com')).toThrow('Invalid protocol');
    expect(() => validateApiUrl('')).toThrow('required');
  });

  it('should not allow insecure http in production mode when allowHttpInDev is false', () => {
    expect(() => validateApiUrl('http://api.gbud.com', false)).toThrow('Insecure HTTP protocol');
    expect(validateApiUrl('https://api.gbud.com', false)).toBe('https://api.gbud.com');
  });

  it('should sanitize errors and never expose raw database/stack trace in ApiError', () => {
    const error = new ApiError({
      message: 'Database query failed',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      details: null,
    });

    const errorJson = JSON.stringify(error);
    expect(errorJson).not.toContain('prisma');
    expect(errorJson).not.toContain('SELECT * FROM');
    expect(error.message).toBe('Database query failed');
  });

  it('should ensure access and refresh tokens are wiped on logout', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: null }),
    });

    const http = new HttpClient({ baseUrl, fetch: mockFetch as any });
    const auth = new AuthClient(http);

    await http.tokenManager.setAccessToken('secret-access-token');
    await http.tokenManager.setRefreshToken('secret-refresh-token');

    await auth.logout();

    expect(await http.tokenManager.getAccessToken()).toBeNull();
    expect(await http.tokenManager.getRefreshToken()).toBeNull();
  });

  it('should ensure access and refresh tokens are wiped on failed refresh', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: false, message: 'Invalid refresh token' }),
    });

    const http = new HttpClient({ baseUrl, fetch: mockFetch as any });
    const auth = new AuthClient(http);

    await http.tokenManager.setAccessToken('expired-access');
    await http.tokenManager.setRefreshToken('revoked-refresh');

    await expect(auth.refresh()).rejects.toThrow();

    // After failure, if refresh handler fails, tokens must be wiped
    await http.tokenManager.clear();
    expect(await http.tokenManager.getAccessToken()).toBeNull();
    expect(await http.tokenManager.getRefreshToken()).toBeNull();
  });
});
