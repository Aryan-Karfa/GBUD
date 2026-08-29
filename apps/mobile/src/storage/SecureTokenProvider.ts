import { TokenProvider } from '@gbud/api-client';
import * as SecureStore from 'expo-secure-store';

export const REFRESH_TOKEN_KEY = 'gbud_mobile_refresh_token';

/**
 * SecureTokenProvider implements the @gbud/api-client TokenProvider interface
 * enforcing the mobile security invariant:
 * - Access token: In-memory only (never persisted to disk or AsyncStorage)
 * - Refresh token: Stored in expo-secure-store (hardware-backed encrypted keychain/Keystore)
 * - In-memory fallback provided for test runners and environments where SecureStore is unavailable
 */
export class SecureTokenProvider implements TokenProvider {
  private inMemoryAccessToken: string | null = null;
  private fallbackRefreshToken: string | null = null;

  public async getAccessToken(): Promise<string | null> {
    return this.inMemoryAccessToken;
  }

  public async setAccessToken(token: string | null): Promise<void> {
    this.inMemoryAccessToken = token;
  }

  public async getRefreshToken(): Promise<string | null> {
    try {
      if (typeof SecureStore?.getItemAsync === 'function') {
        const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        return stored || null;
      }
    } catch {
      // SecureStore unavailable in test or mock environment; fall back
    }
    return this.fallbackRefreshToken;
  }

  public async setRefreshToken(token: string | null): Promise<void> {
    try {
      if (
        typeof SecureStore?.setItemAsync === 'function' &&
        typeof SecureStore?.deleteItemAsync === 'function'
      ) {
        if (token) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
        } else {
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
      }
    } catch {
      // SecureStore unavailable; fall back
    }
    this.fallbackRefreshToken = token;
  }

  public async clear(): Promise<void> {
    this.inMemoryAccessToken = null;
    this.fallbackRefreshToken = null;
    try {
      if (typeof SecureStore?.deleteItemAsync === 'function') {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Ignore cleanup error in non-native environment
    }
  }
}

export const mobileTokenProvider = new SecureTokenProvider();
