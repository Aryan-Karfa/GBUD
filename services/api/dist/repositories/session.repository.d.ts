import { Session, Prisma } from '@prisma/client';
export declare class SessionRepository {
    create(data: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }, tx?: Prisma.TransactionClient): Promise<Session>;
    findByTokenHash(tokenHash: string, tx?: Prisma.TransactionClient): Promise<Session | null>;
    revokeByTokenHash(tokenHash: string, tx?: Prisma.TransactionClient): Promise<Session | null>;
    /**
     * Atomic Refresh Token Rotation:
     * 1. Finds active session by oldTokenHash inside a Prisma $transaction.
     * 2. Verifies session exists, is not revoked, and is not expired.
     * 3. Atomically revokes old session (updating revokedAt) ensuring no concurrent re-use.
     * 4. Creates and returns new session.
     */
    rotateSessionAtomic(oldTokenHash: string, newTokenHash: string, newExpiresAt: Date): Promise<{
        oldSession: Session;
        newSession: Session;
    } | null>;
    revokeAllByUserId(userId: string, tx?: Prisma.TransactionClient): Promise<Prisma.BatchPayload>;
}
export declare const sessionRepository: SessionRepository;
//# sourceMappingURL=session.repository.d.ts.map