import { API_ROUTES } from '@gbud/constants';
import { AuthResponseData, UserDTO } from '@gbud/types';
import { LoginInput, RegisterInput, RefreshInput } from '@gbud/validation';
import { HttpClient } from '../client/http-client';
import { RequestOptions } from '../client/request';

export class AuthEndpointClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public async register(
    input: RegisterInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<AuthResponseData> {
    return this.http.post<AuthResponseData>(API_ROUTES.AUTH.REGISTER, input, {
      ...options,
      skipAuth: true,
    });
  }

  public async login(
    input: LoginInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<AuthResponseData> {
    return this.http.post<AuthResponseData>(API_ROUTES.AUTH.LOGIN, input, {
      ...options,
      skipAuth: true,
    });
  }

  public async refresh(
    input?: RefreshInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<AuthResponseData> {
    return this.http.post<AuthResponseData>(API_ROUTES.AUTH.REFRESH, input ?? {}, {
      ...options,
      skipAuth: true,
    });
  }

  public async logout(
    input?: RefreshInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<null> {
    return this.http.post<null>(API_ROUTES.AUTH.LOGOUT, input, options);
  }

  public async me(
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<UserDTO> {
    return this.http.get<UserDTO>(API_ROUTES.AUTH.ME, options);
  }
}
