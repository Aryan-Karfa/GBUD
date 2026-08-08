import { prisma } from '../config/prisma';
import { Session, Prisma } from '@prisma/client';

export class SessionRepository {
  public async create(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    tx: Prisma.TransactionClient = prisma
  ): Promise<Session> {
    return tx.session.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  public async findByTokenHash(tokenHash: string, tx: Prisma.TransactionClient = prisma): Promise<Session | null> {
    return tx.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  public async revokeByTokenHash(tokenHash: string, tx: Prisma.TransactionClient = prisma): Promise<Session | null> {
    try {
      return await tx.session.update({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    } catch (_error) {
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
  public async rotateSessionAtomic(
    oldTokenHash: string,
    newTokenHash: string,
    newExpiresAt: Date
  ): Promise<{ oldSession: Session; newSession: Session } | null> {
    return prisma.$transaction(async (tx) => {
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

  public async revokeAllByUserId(userId: string, tx: Prisma.TransactionClient = prisma): Promise<Prisma.BatchPayload> {
    return tx.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const sessionRepository = new SessionRepository();
