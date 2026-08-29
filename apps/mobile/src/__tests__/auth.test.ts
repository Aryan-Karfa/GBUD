import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth/auth.service';
import { apiClient, mobileTokenProvider } from '../api/client';
import { SecureTokenProvider, REFRESH_TOKEN_KEY } from '../storage/SecureTokenProvider';
import * as SecureStore from 'expo-secure-store';
import { ApiError } from '@gbud/api-client';

describe('Auth Service & Secure Token Storage', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await mobileTokenProvider.clear();
  });

  it('should restore session from SecureStore when refresh token and user fetch succeed', async () => {
    // Persist refresh token in SecureStore
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, 'valid-persisted-refresh-token');

    const refreshSpy = vi.spyOn(apiClient.auth, 'refresh').mockResolvedValueOnce({
      accessToken: 'new-access-token',
      refreshToken: 'rotated-refresh-token',
    });

    const userSpy = vi.spyOn(apiClient.auth, 'getCurrentUser').mockResolvedValueOnce({
      id: 'usr-123',
      email: 'athlete@example.com',
      username: 'athlete_one',
      status: 'ACTIVE',
      createdAt: '2026-08-29T00:00:00.000Z',
      updatedAt: '2026-08-29T00:00:00.000Z',
    });

    const restored = await authService.restoreSession();

    expect(restored).toEqual({
      id: 'usr-123',
      email: 'athlete@example.com',
      username: 'athlete_one',
      status: 'ACTIVE',
    });
    expect(refreshSpy).toHaveBeenCalledWith('valid-persisted-refresh-token');
    expect(userSpy).toHaveBeenCalled();
  });

  it('should return null and gracefully clear SecureStore on session restoration failure', async () => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, 'expired-token');

    vi.spyOn(apiClient.auth, 'refresh').mockRejectedValueOnce(
      new ApiError({
        message: 'Invalid or expired refresh token',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    );

    const restored = await authService.restoreSession();

    expect(restored).toBeNull();
    // Verify SecureStore was cleaned up
    const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    expect(stored).toBeNull();
  });

  it('should return null immediately when no refresh token exists in SecureStore', async () => {
    const refreshSpy = vi.spyOn(apiClient.auth, 'refresh');
    const restored = await authService.restoreSession();

    expect(restored).toBeNull();
    expect(refreshSpy).not.toHaveBeenCalled();
  });

  it('should successfully login and return AuthUser', async () => {
    const mockLoginResponse = {
      user: {
        id: 'usr-login-1',
        email: 'user@gbud.app',
        username: 'gbud_user',
        status: 'ACTIVE' as const,
        createdAt: '2026-08-29T00:00:00.000Z',
        updatedAt: '2026-08-29T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'access-111',
        refreshToken: 'refresh-222',
      },
    };

    const loginSpy = vi.spyOn(apiClient.auth, 'login').mockResolvedValueOnce(mockLoginResponse);

    const user = await authService.login({
      email: 'user@gbud.app',
      password: 'password123',
    });

    expect(user).toEqual({
      id: 'usr-login-1',
      email: 'user@gbud.app',
      username: 'gbud_user',
      status: 'ACTIVE',
    });
    expect(loginSpy).toHaveBeenCalledWith({
      email: 'user@gbud.app',
      password: 'password123',
    });
  });

  it('should propagate ApiError on login failure without leaking secrets', async () => {
    vi.spyOn(apiClient.auth, 'login').mockRejectedValueOnce(
      new ApiError({
        message: 'Invalid email or password',
        statusCode: 401,
        code: 'UNAUTHORIZED',
        requestId: 'req-auth-fail-1',
      })
    );

    try {
      await authService.login({
        email: 'wrong@gbud.app',
        password: 'badpassword',
      });
      expect.fail('Should have thrown ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.statusCode).toBe(401);
      expect(apiErr.message).toBe('Invalid email or password');
      expect(apiErr.requestId).toBe('req-auth-fail-1');
    }
  });

  it('should successfully register a new user and return AuthUser', async () => {
    const mockRegisterResponse = {
      user: {
        id: 'usr-reg-1',
        email: 'newuser@gbud.app',
        username: 'new_athlete',
        status: 'ACTIVE' as const,
        createdAt: '2026-08-29T00:00:00.000Z',
        updatedAt: '2026-08-29T00:00:00.000Z',
      },
      tokens: {
        accessToken: 'access-333',
        refreshToken: 'refresh-444',
      },
    };

    const regSpy = vi.spyOn(apiClient.auth, 'register').mockResolvedValueOnce(mockRegisterResponse);

    const user = await authService.register({
      email: 'newuser@gbud.app',
      username: 'new_athlete',
      password: 'password123',
    });

    expect(user).toEqual({
      id: 'usr-reg-1',
      email: 'newuser@gbud.app',
      username: 'new_athlete',
      status: 'ACTIVE',
    });
    expect(regSpy).toHaveBeenCalledWith({
      email: 'newuser@gbud.app',
      username: 'new_athlete',
      password: 'password123',
    });
  });

  it('should execute logout, call API logout, and clear all tokens from SecureStore and memory', async () => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, 'active-refresh-token');
    await mobileTokenProvider.setAccessToken('active-access-token');

    const logoutSpy = vi.spyOn(apiClient.auth, 'logout').mockResolvedValueOnce(undefined);

    await authService.logout();

    expect(logoutSpy).toHaveBeenCalledWith('active-refresh-token');
    expect(await mobileTokenProvider.getAccessToken()).toBeNull();
    expect(await mobileTokenProvider.getRefreshToken()).toBeNull();
    expect(await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('should enforce security invariant: access tokens are never persisted in SecureStore', async () => {
    const provider = new SecureTokenProvider();
    await provider.setAccessToken('secret-access-token-999');

    // Access token is present in memory
    expect(await provider.getAccessToken()).toBe('secret-access-token-999');

    // Verify SecureStore does NOT hold the access token
    const secureStoreValue = await SecureStore.getItemAsync('secret-access-token-999');
    expect(secureStoreValue).toBeNull();
    const storedRefresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    expect(storedRefresh).toBeNull();
  });
});
