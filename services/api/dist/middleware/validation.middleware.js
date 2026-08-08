"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
const app_error_1 = require("../utils/app-error");
function validateRequest(schemas) {
    return async (req, _res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || (error && typeof error === 'object' && error.name === 'ZodError')) {
                const zodError = error;
                const formattedDetails = zodError.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return next(app_error_1.AppError.validationError('Validation failed', formattedDetails));
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validation.middleware.js.map