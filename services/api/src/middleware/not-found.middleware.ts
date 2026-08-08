import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';

export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
}
