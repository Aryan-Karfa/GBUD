import { describe, it, expect } from 'vitest';
import { ApiError } from '../errors/api-error';

describe('ApiError', () => {
  it('should initialize with default status code and code', () => {
    const error = new ApiError({ message: 'Something went wrong' });
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Something went wrong');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.details).toBeNull();
    expect(error.requestId).toBeNull();
    expect(error.isServerError()).toBe(true);
  });

  it('should correctly identify 401 UNAUTHORIZED', () => {
    const error = new ApiError({
      message: 'Token expired',
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
    expect(error.isUnauthorized()).toBe(true);
    expect(error.isForbidden()).toBe(false);
  });

  it('should correctly identify 403 FORBIDDEN', () => {
    const error = new ApiError({
      message: 'Access denied',
      statusCode: 403,
      code: 'FORBIDDEN',
    });
    expect(error.isForbidden()).toBe(true);
    expect(error.isUnauthorized()).toBe(false);
  });

  it('should correctly identify 404 NOT_FOUND', () => {
    const error = new ApiError({
      message: 'Not found',
      statusCode: 404,
      code: 'NOT_FOUND',
    });
    expect(error.isNotFound()).toBe(true);
  });

  it('should correctly identify 409 CONFLICT', () => {
    const error = new ApiError({
      message: 'Email already registered',
      statusCode: 409,
      code: 'CONFLICT',
    });
    expect(error.isConflict()).toBe(true);
  });

  it('should correctly identify 422 VALIDATION_ERROR and preserve field details', () => {
    const details = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Password must be at least 8 characters' },
    ];
    const error = new ApiError({
      message: 'Validation failed',
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      details,
      requestId: 'req-val-123',
    });

    expect(error.isValidationError()).toBe(true);
    expect(error.details).toEqual(details);
    expect(error.requestId).toBe('req-val-123');
  });

  it('should create network error instance with fromNetworkError', () => {
    const error = ApiError.fromNetworkError(new Error('Failed to fetch'));
    expect(error.isNetworkError()).toBe(true);
    expect(error.statusCode).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.message).toContain('Unable to connect to GBUD API');
  });

  it('should create timeout error instance with fromTimeout', () => {
    const error = ApiError.fromTimeout(10000);
    expect(error.isTimeout()).toBe(true);
    expect(error.statusCode).toBe(408);
    expect(error.code).toBe('TIMEOUT_ERROR');
    expect(error.message).toBe('Request timed out after 10000ms');
  });
});
