import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export interface ValidationSchemas {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}
export declare function validateRequest(schemas: ValidationSchemas): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map