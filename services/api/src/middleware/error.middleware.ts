import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { APIErrorResponse } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { appConfig } from '../config';

export function errorMiddleware(
  err: Error | AppError,
  _req: Request,
  res: Response<APIErrorResponse>,
  _next: NextFunction
): void {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: APIErrorResponse['error']['details'] = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err && typeof err === 'object' && 'statusCode' in err) {
    statusCode = (err as { statusCode: number }).statusCode || 500;
    message = err.message || 'An unexpected error occurred';
  }

  // In production, mask unhandled 500 internal errors for security
  if (statusCode >= 500) {
    if (appConfig.env !== 'test') {
      const reqId = _req.id || 'N/A';
      console.error(
        `[${new Date().toISOString()}] [${reqId}] Internal Server Error: ${err?.message || 'Unknown error'}\n` +
        `  Route: ${_req.method} ${_req.originalUrl}\n` +
        `  Stack: ${err?.stack || 'No stack trace available'}`
      );
    }

    if (appConfig.env === 'production') {
      message = 'Internal server error';
      details = null;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details,
    },
    timestamp: formatTimestamp(),
  });
}
