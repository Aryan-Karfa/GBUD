"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = exports.SessionRepository = void 0;
const prisma_1 = require("../config/prisma");
class SessionRepository {
    async create(data, tx = prisma_1.prisma) {
        return tx.session.create({
            data: {
                userId: data.userId,
                tokenHash: data.tokenHash,
                expiresAt: data.expiresAt,
            },
        });
    }
    async findByTokenHash(tokenHash, tx = prisma_1.prisma) {
        return tx.session.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
    }
    async revokeByTokenHash(tokenHash, tx = prisma_1.prisma) {
        try {
            return await tx.session.update({
                where: { tokenHash },
                data: { revokedAt: new Date() },
            });
        }
        catch (_error) {
            return null;
        }
    }
    /**
     * Atomic Refresh Token Rotation:
     * 1. Finds active session by oldTokenHash inside a Prisma $transaction.
     * 2. Verifies session exists, is not revoked, and is not expired.
     * 3. Atomically revokes old session (updating revokedAt) ensuring no concurrent re-use.
     * 4. Creates and returns new session.
     */
    async rotateSessionAtomic(oldTokenHash, newTokenHash, newExpiresAt) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const now = new Date();
            const oldSession = await tx.session.findUnique({
                where: { tokenHash: oldTokenHash },
                include: { user: true },
            });
            if (!oldSession || oldSession.revokedAt !== null || oldSession.expiresAt < now) {
                return null;
            }
            await tx.session.update({
                where: { id: oldSession.id },
                data: { revokedAt: now },
            });
            const newSession = await tx.session.create({
                data: {
                    userId: oldSession.userId,
                    tokenHash: newTokenHash,
                    expiresAt: newExpiresAt,
                },
            });
            return { oldSession, newSession };
        });
    }
    async revokeAllByUserId(userId, tx = prisma_1.prisma) {
        return tx.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}
exports.SessionRepository = SessionRepository;
exports.sessionRepository = new SessionRepository();
//# sourceMappingURL=session.repository.js.map