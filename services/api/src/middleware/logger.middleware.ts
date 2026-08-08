import { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config';

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (appConfig.env === 'test') {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] [${req.id || 'N/A'}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });

  next();
}
