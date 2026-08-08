import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
export interface ValidationSchemas {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}
export declare function validateRequest(schemas: ValidationSchemas): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map