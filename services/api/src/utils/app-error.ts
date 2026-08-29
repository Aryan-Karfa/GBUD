import { APIErrorBody } from '@gbud/types';

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
<<<<<<< HEAD
=======
  | 'FORBIDDEN'
>>>>>>> b83a35e (Completed Phase 9)
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: APIErrorBody['details'];

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = 'INTERNAL_SERVER_ERROR',
    details: APIErrorBody['details'] = null
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, details: APIErrorBody['details'] = null): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  public static unauthorized(message: string = 'Authentication failed'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

<<<<<<< HEAD
=======
  public static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

>>>>>>> b83a35e (Completed Phase 9)
  public static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  public static conflict(message: string = 'Conflict', details: APIErrorBody['details'] = null): AppError {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  public static validationError(message: string = 'Validation failed', details: APIErrorBody['details'] = null): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  public static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
