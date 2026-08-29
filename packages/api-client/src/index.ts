import { ApiClientConfig } from './config/api-config';
import { HttpClient } from './client/http-client';
import { AuthClient } from './auth/auth-client';
import { HealthEndpointClient } from './endpoints/health';
import { AuthEndpointClient } from './endpoints/auth';
import { TrainEndpointClient } from './endpoints/train';
import { ProgressEndpointClient } from './endpoints/progress';
import { FuelEndpointClient } from './endpoints/fuel';
import { TokenManager } from './auth/token-manager';

export class ApiClient {
  public readonly http: HttpClient;
  public readonly auth: AuthClient;
  public readonly health: HealthEndpointClient;
  public readonly train: TrainEndpointClient;
  public readonly progress: ProgressEndpointClient;
  public readonly fuel: FuelEndpointClient;
  public readonly rawAuth: AuthEndpointClient;

  constructor(config: ApiClientConfig) {
    this.http = new HttpClient(config);
    this.auth = new AuthClient(this.http);
    this.health = new HealthEndpointClient(this.http);
    this.train = new TrainEndpointClient(this.http);
    this.progress = new ProgressEndpointClient(this.http);
    this.fuel = new FuelEndpointClient(this.http);
    this.rawAuth = new AuthEndpointClient(this.http);
  }

  public get tokenManager(): TokenManager {
    return this.http.tokenManager;
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

// Errors
export * from './errors/api-error';

// Config
export * from './config/api-config';

// Auth & Token Management
export * from './auth/auth-types';
export * from './auth/token-manager';
export * from './auth/auth-client';

// Client & Request
export * from './client/request';
export * from './client/response';
export * from './client/http-client';

// Endpoints
export * from './endpoints/health';
export * from './endpoints/auth';
export * from './endpoints/train';
export * from './endpoints/progress';
export * from './endpoints/fuel';

// Re-export constants
export { API_ROUTES } from '@gbud/constants';
