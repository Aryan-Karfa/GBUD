import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { APIErrorResponse } from '@gbud/types';
export declare function errorMiddleware(err: Error | AppError, _req: Request, res: Response<APIErrorResponse>, _next: NextFunction): void;
//# sourceMappingURL=error.middleware.d.ts.map