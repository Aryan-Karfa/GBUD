import { TokenProvider } from './auth-types';

export class InMemoryTokenProvider implements TokenProvider {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  public async getAccessToken(): Promise<string | null> {
    return this.accessToken;
  }

  public async setAccessToken(token: string | null): Promise<void> {
    this.accessToken = token;
  }

  public async getRefreshToken(): Promise<string | null> {
    return this.refreshToken;
  }

  public async setRefreshToken(token: string | null): Promise<void> {
    this.refreshToken = token;
  }

  public async clear(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

export class TokenManager {
  private readonly provider: TokenProvider;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(provider?: TokenProvider) {
    this.provider = provider || new InMemoryTokenProvider();
  }

  public async getAccessToken(): Promise<string | null> {
    return this.provider.getAccessToken();
  }

  public async setAccessToken(token: string | null): Promise<void> {
    await this.provider.setAccessToken(token);
  }

  public async getRefreshToken(): Promise<string | null> {
    if (this.provider.getRefreshToken) {
      return this.provider.getRefreshToken();
    }
    return null;
  }

  public async setRefreshToken(token: string | null): Promise<void> {
    if (this.provider.setRefreshToken) {
      await this.provider.setRefreshToken(token);
    }
  }

  public async clear(): Promise<void> {
    await this.provider.clear();
  }

  public getProvider(): TokenProvider {
    return this.provider;
  }

  /**
   * Executes a refresh handler with single-flight locking.
   * If multiple asynchronous requests fail with 401 concurrently,
   * all waiting requests will share the same in-flight refresh promise.
   */
  public async executeSingleFlightRefresh(
    refreshFn: () => Promise<string | null>
  ): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const newToken = await refreshFn();
        return newToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }
}
