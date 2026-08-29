import { API_ROUTES } from '@gbud/constants';
import { HealthCheckStatus } from '@gbud/types';
import { HttpClient } from '../client/http-client';
import { DEFAULT_HEALTH_TIMEOUT_MS } from '../config/api-config';

export class HealthEndpointClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public async healthCheck(options?: {
    timeout?: number;
    signal?: AbortSignal;
  }): Promise<HealthCheckStatus> {
    return this.http.get<HealthCheckStatus>(API_ROUTES.HEALTH, {
      skipAuth: true,
      timeout: options?.timeout ?? DEFAULT_HEALTH_TIMEOUT_MS,
      signal: options?.signal,
    });
  }
}
