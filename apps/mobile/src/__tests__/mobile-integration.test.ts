import { describe, it, expect, vi, beforeEach } from 'vitest';
import { env } from '../config/env';
import { apiClient, mobileTokenProvider } from '../api/client';
import { SecureTokenProvider } from '../storage/SecureTokenProvider';
import { ApiError } from '@gbud/api-client';

describe('Mobile Application Integration & API Client', () => {
  beforeEach(async () => {
    await mobileTokenProvider.clear();
  });

  it('should have a valid mobile API base URL configured', () => {
    expect(env.apiUrl).toBeDefined();
    expect(typeof env.apiUrl).toBe('string');
    expect(env.apiUrl).toMatch(/^https?:\/\//);
  });

  it('should initialize mobile apiClient with tokenProvider', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.http).toBeDefined();
    expect(apiClient.auth).toBeDefined();
    expect(apiClient.health).toBeDefined();
    expect(apiClient.train).toBeDefined();
    expect(apiClient.progress).toBeDefined();
    expect(apiClient.fuel).toBeDefined();
  });

  it('should manage access and refresh tokens with SecureTokenProvider', async () => {
    const provider = new SecureTokenProvider();
    expect(await provider.getAccessToken()).toBeNull();
    expect(await provider.getRefreshToken()).toBeNull();

    await provider.setAccessToken('mobile-access-token-123');
    await provider.setRefreshToken('mobile-refresh-token-456');

    expect(await provider.getAccessToken()).toBe('mobile-access-token-123');
    expect(await provider.getRefreshToken()).toBe('mobile-refresh-token-456');

    await provider.clear();
    expect(await provider.getAccessToken()).toBeNull();
    expect(await provider.getRefreshToken()).toBeNull();
  });

  it('should execute health check through mobile apiClient', async () => {
    const mockHealthStatus = {
      status: 'ok' as const,
      service: 'gbud-api',
      version: '0.1.0',
      timestamp: '2026-08-19T00:00:00.000Z',
    };

    const spy = vi.spyOn(apiClient.health, 'healthCheck').mockResolvedValueOnce(mockHealthStatus);

    const result = await apiClient.health.healthCheck();
    expect(result).toEqual(mockHealthStatus);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle API errors with ApiError instance', async () => {
    vi.spyOn(apiClient.auth, 'login').mockRejectedValueOnce(
      new ApiError({
        message: 'Invalid credentials',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        requestId: 'req-mob-err-1',
      })
    );

    try {
      await apiClient.auth.login({ email: 'bad@example.com', password: 'wrong' });
      expect.fail('Should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.statusCode).toBe(401);
      expect(apiErr.code).toBe('UNAUTHORIZED');
      expect(apiErr.requestId).toBe('req-mob-err-1');
      expect(apiErr.isUnauthorized()).toBe(true);
    }
  });
});
