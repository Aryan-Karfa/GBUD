import { JWTPayload } from '@gbud/types';
export declare function signAccessToken(payload: {
    id: string;
    email: string;
    username: string;
}): string;
export declare function verifyAccessToken(token: string): JWTPayload;
export declare function generateRefreshToken(): string;
export declare function hashRefreshToken(token: string): string;
//# sourceMappingURL=jwt.d.ts.map