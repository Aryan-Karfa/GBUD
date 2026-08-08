export interface APIErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface APIErrorBody {
  code: string;
  details?: APIErrorDetail[] | Record<string, unknown> | null;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: APIErrorBody | null;
  timestamp: string;
}

export interface APIErrorResponse {
  success: false;
  message: string;
  error: APIErrorBody;
  timestamp: string;
}

export interface HealthCheckStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
