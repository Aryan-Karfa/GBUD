import { LoginInput, RegisterInput } from '@gbud/validation';
import { apiClient, mobileTokenProvider } from '../api/client';
import { AuthUser } from './auth.types';

export const authService = {
  /**
   * Restores an existing session on app startup:
   * 1. Reads the persisted refresh token from SecureStore.
   * 2. If present, requests a new access token via /auth/refresh.
   * 3. Fetches the authenticated user profile via /auth/me.
   * 4. Returns the user or null if unauthenticated.
   * Gracefully fails and clears stale storage on any authentication failure.
   */
  async restoreSession(): Promise<AuthUser | null> {
    try {
      const storedRefreshToken = await mobileTokenProvider.getRefreshToken();
      if (!storedRefreshToken) {
        return null;
      }

      await apiClient.auth.refresh(storedRefreshToken);
      const user = await apiClient.auth.getCurrentUser();
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
      };
    } catch {
      // Refresh token expired, revoked, or network failed; securely wipe storage
      await mobileTokenProvider.clear();
      return null;
    }
  },

  /**
   * Authenticates with email and password.
   * The API client automatically handles setting the access and refresh tokens.
   */
  async login(input: LoginInput): Promise<AuthUser> {
    const data = await apiClient.auth.login(input);
    return {
      id: data.user.id,
      email: data.user.email,
      username: data.user.username,
      status: data.user.status,
    };
  },

  /**
   * Registers a new user account.
   * The API client automatically sets access and refresh tokens upon successful creation.
   */
  async register(input: RegisterInput): Promise<AuthUser> {
    const data = await apiClient.auth.register(input);
    return {
      id: data.user.id,
      email: data.user.email,
      username: data.user.username,
      status: data.user.status,
    };
  },

  /**
   * Logs out from the API and wipes all in-memory and SecureStore tokens.
   */
  async logout(): Promise<void> {
    try {
      const storedRefreshToken = await mobileTokenProvider.getRefreshToken();
      await apiClient.auth.logout(storedRefreshToken || undefined);
    } catch {
      // Ignore API logout failures, local cleanup must always proceed
    } finally {
      await mobileTokenProvider.clear();
    }
  },
};
