import { APIErrorBody } from '@gbud/types';
export type ErrorCode = 'BAD_REQUEST' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_SERVER_ERROR';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: ErrorCode;
    readonly details: APIErrorBody['details'];
    constructor(message: string, statusCode?: number, code?: ErrorCode, details?: APIErrorBody['details']);
    static badRequest(message: string, details?: APIErrorBody['details']): AppError;
    static notFound(message?: string): AppError;
    static validationError(message?: string, details?: APIErrorBody['details']): AppError;
    static internal(message?: string): AppError;
}
//# sourceMappingURL=app-error.d.ts.map