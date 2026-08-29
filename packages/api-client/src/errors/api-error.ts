import { APIErrorDetail } from '@gbud/types';

export interface ApiErrorParams {
  message: string;
  statusCode?: number;
  code?: string;
  details?: APIErrorDetail[] | Record<string, unknown> | null;
  requestId?: string | null;
  timestamp?: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: APIErrorDetail[] | Record<string, unknown> | null;
  public readonly requestId: string | null;
  public readonly timestamp: string;

  constructor({
    message,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details = null,
    requestId = null,
    timestamp = new Date().toISOString(),
  }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.timestamp = timestamp;

    // Maintains proper prototype chain in transpiled ES5/ES6
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public isUnauthorized(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED';
  }

  public isForbidden(): boolean {
    return this.statusCode === 403 || this.code === 'FORBIDDEN';
  }

  public isNotFound(): boolean {
    return this.statusCode === 404 || this.code === 'NOT_FOUND';
  }

  public isConflict(): boolean {
    return this.statusCode === 409 || this.code === 'CONFLICT';
  }

  public isValidationError(): boolean {
    return this.statusCode === 422 || this.code === 'VALIDATION_ERROR';
  }

  public isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }

  public isTimeout(): boolean {
    return this.code === 'TIMEOUT_ERROR';
  }

  public isServerError(): boolean {
    return this.statusCode >= 500;
  }

  public static fromNetworkError(originalError?: unknown): ApiError {
    const rawMessage = originalError instanceof Error ? originalError.message : 'Network request failed';
    return new ApiError({
      message: rawMessage.includes('aborted') || rawMessage.includes('abort')
        ? 'Request was cancelled'
        : 'Unable to connect to GBUD API. Please check your network connection.',
      statusCode: 0,
      code: 'NETWORK_ERROR',
      details: null,
      requestId: null,
    });
  }

  public static fromTimeout(timeoutMs: number): ApiError {
    return new ApiError({
      message: `Request timed out after ${timeoutMs}ms`,
      statusCode: 408,
      code: 'TIMEOUT_ERROR',
      details: null,
      requestId: null,
    });
  }
}
