import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/app-error';

export interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export function validateRequest(schemas: ValidationSchemas) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError || (error && typeof error === 'object' && (error as { name?: string }).name === 'ZodError')) {
        const zodError = error as ZodError;
        const formattedDetails = zodError.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(AppError.validationError('Validation failed', formattedDetails));
      }
      next(error);
    }
  };
}
