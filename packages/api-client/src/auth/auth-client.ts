import { API_ROUTES } from '@gbud/constants';
import { AuthResponseData, UserDTO } from '@gbud/types';
import { LoginInput, RegisterInput } from '@gbud/validation';
import { HttpClient } from '../client/http-client';
import { RefreshResult } from './auth-types';

export class AuthClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
    // Bind refresh handler into http client so automatic 401 retry works seamlessly
    this.http.setRefreshHandler(async () => {
      try {
        const storedRefreshToken = await this.http.tokenManager.getRefreshToken();
        const res = await this.refresh(storedRefreshToken || undefined);
        return res.accessToken;
      } catch {
        return null;
      }
    });
  }

  public async register(input: RegisterInput): Promise<AuthResponseData> {
    const data = await this.http.post<AuthResponseData>(
      API_ROUTES.AUTH.REGISTER,
      input,
      { skipAuth: true }
    );

    if (data?.tokens?.accessToken) {
      await this.http.tokenManager.setAccessToken(data.tokens.accessToken);
    }
    if (data?.tokens?.refreshToken) {
      await this.http.tokenManager.setRefreshToken(data.tokens.refreshToken);
    }

    return data;
  }

  public async login(input: LoginInput): Promise<AuthResponseData> {
    const data = await this.http.post<AuthResponseData>(
      API_ROUTES.AUTH.LOGIN,
      input,
      { skipAuth: true }
    );

    if (data?.tokens?.accessToken) {
      await this.http.tokenManager.setAccessToken(data.tokens.accessToken);
    }
    if (data?.tokens?.refreshToken) {
      await this.http.tokenManager.setRefreshToken(data.tokens.refreshToken);
    }

    return data;
  }

  public async refresh(refreshToken?: string): Promise<RefreshResult> {
    const tokenToUse = refreshToken || (await this.http.tokenManager.getRefreshToken());
    const body = tokenToUse ? { refreshToken: tokenToUse } : {};

    const data = await this.http.post<AuthResponseData>(
      API_ROUTES.AUTH.REFRESH,
      body,
      { skipAuth: true }
    );

    if (data?.tokens?.accessToken) {
      await this.http.tokenManager.setAccessToken(data.tokens.accessToken);
    }
    if (data?.tokens?.refreshToken) {
      await this.http.tokenManager.setRefreshToken(data.tokens.refreshToken);
    }

    return {
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    };
  }

  public async logout(refreshToken?: string): Promise<void> {
    try {
      const tokenToUse = refreshToken || (await this.http.tokenManager.getRefreshToken());
      const body = tokenToUse ? { refreshToken: tokenToUse } : undefined;
      await this.http.post<null>(API_ROUTES.AUTH.LOGOUT, body, { skipAuth: false });
    } catch {
      // Ignore network / logout error: client local session must always be cleared
    } finally {
      await this.http.tokenManager.clear();
    }
  }

  public async getCurrentUser(): Promise<UserDTO> {
    return this.http.get<UserDTO>(API_ROUTES.AUTH.ME);
  }
}
