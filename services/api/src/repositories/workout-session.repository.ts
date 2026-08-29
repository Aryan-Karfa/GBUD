import { prisma } from '../config/prisma';
import { WorkoutSession, WorkoutSessionExercise, WorkoutSet, Prisma } from '@prisma/client';
import { TemplateWithExercises } from './workout-template.repository';

export type SessionWithHierarchy = WorkoutSession & {
  sessionExercises: (WorkoutSessionExercise & {
    sets: WorkoutSet[];
  })[];
};

export interface HistoryFilterOptions {
  page: number;
  limit: number;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export class WorkoutSessionRepository {
  private readonly defaultInclude = {
    sessionExercises: {
      orderBy: { order: 'asc' as const },
      include: {
        sets: {
          orderBy: { setNumber: 'asc' as const },
        },
      },
    },
  };

  public async createSessionWithSnapshot(
    userId: string,
    template: TemplateWithExercises
  ): Promise<SessionWithHierarchy> {
    return prisma.$transaction(async (tx) => {
      // 1. Check if user already has an active IN_PROGRESS session
      const existingActive = await tx.workoutSession.findFirst({
        where: { userId, status: 'IN_PROGRESS' },
      });

      if (existingActive) {
        throw new Error('DUPLICATE_ACTIVE_SESSION');
      }

      // 2. Create the WorkoutSession record
      const session = await tx.workoutSession.create({
        data: {
          userId,
          workoutTemplateId: template.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      // 3. Snapshot template exercises into WorkoutSessionExercise records
      for (const te of template.templateExercises) {
        await tx.workoutSessionExercise.create({
          data: {
            workoutSessionId: session.id,
            exerciseId: te.exerciseId,
            name: te.exercise.name,
            order: te.order,
            notes: te.notes,
          },
        });
      }

      return tx.workoutSession.findUniqueOrThrow({
        where: { id: session.id },
        include: this.defaultInclude,
      });
    });
  }

  public async findActiveByUserId(
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<SessionWithHierarchy | null> {
    return tx.workoutSession.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      include: this.defaultInclude,
    });
  }

  public async findByIdAndUserId(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<SessionWithHierarchy | null> {
    return tx.workoutSession.findFirst({
      where: { id, userId },
      include: this.defaultInclude,
    });
  }

  public async findHistoryByUserId(
    userId: string,
    options: HistoryFilterOptions,
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ items: SessionWithHierarchy[]; total: number }> {
    const where: Prisma.WorkoutSessionWhereInput = {
      userId,
      ...(options.status ? { status: options.status } : {}),
    };

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      tx.workoutSession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take: options.limit,
        include: this.defaultInclude,
      }),
      tx.workoutSession.count({ where }),
    ]);

    return { items, total };
  }

  public async addSet(
    sessionId: string,
    userId: string,
    sessionExerciseId: string,
    data: { reps?: number; weight?: number }
  ): Promise<SessionWithHierarchy | null> {
    return prisma.$transaction(async (tx) => {
      const session = await this.findByIdAndUserId(sessionId, userId, tx);
      if (!session) return null;

      if (session.status !== 'IN_PROGRESS') {
        throw new Error('SESSION_NOT_IN_PROGRESS');
      }

      const exerciseItem = session.sessionExercises.find((se) => se.id === sessionExerciseId);
      if (!exerciseItem) return null;

      const maxSetResult = await tx.workoutSet.aggregate({
        where: { workoutSessionExerciseId: sessionExerciseId },
        _max: { setNumber: true },
      });

      const nextSetNumber = (maxSetResult._max.setNumber ?? 0) + 1;

      await tx.workoutSet.create({
        data: {
          workoutSessionExerciseId: sessionExerciseId,
          setNumber: nextSetNumber,
          reps: data.reps ?? null,
          weight: data.weight ?? null,
        },
      });

      return this.findByIdAndUserId(sessionId, userId, tx);
    });
  }

  public async updateSet(
    sessionId: string,
    userId: string,
    sessionExerciseId: string,
    setId: string,
    data: { reps?: number; weight?: number }
  ): Promise<SessionWithHierarchy | null> {
    return prisma.$transaction(async (tx) => {
      const session = await this.findByIdAndUserId(sessionId, userId, tx);
      if (!session) return null;

      if (session.status !== 'IN_PROGRESS') {
        throw new Error('SESSION_NOT_IN_PROGRESS');
      }

      const exerciseItem = session.sessionExercises.find((se) => se.id === sessionExerciseId);
      if (!exerciseItem) return null;

      const setItem = exerciseItem.sets.find((s) => s.id === setId);
      if (!setItem) return null;

      await tx.workoutSet.update({
        where: { id: setId },
        data: {
          ...(data.reps !== undefined && { reps: data.reps }),
          ...(data.weight !== undefined && { weight: data.weight }),
        },
      });

      return this.findByIdAndUserId(sessionId, userId, tx);
    });
  }

  public async deleteSet(
    sessionId: string,
    userId: string,
    sessionExerciseId: string,
    setId: string
  ): Promise<SessionWithHierarchy | null> {
    return prisma.$transaction(async (tx) => {
      const session = await this.findByIdAndUserId(sessionId, userId, tx);
      if (!session) return null;

      if (session.status !== 'IN_PROGRESS') {
        throw new Error('SESSION_NOT_IN_PROGRESS');
      }

      const exerciseItem = session.sessionExercises.find((se) => se.id === sessionExerciseId);
      if (!exerciseItem) return null;

      const setItem = exerciseItem.sets.find((s) => s.id === setId);
      if (!setItem) return null;

      await tx.workoutSet.delete({
        where: { id: setId },
      });

      const remainingSets = await tx.workoutSet.findMany({
        where: { workoutSessionExerciseId: sessionExerciseId },
        orderBy: { setNumber: 'asc' },
      });

      for (let i = 0; i < remainingSets.length; i++) {
        await tx.workoutSet.update({
          where: { id: remainingSets[i].id },
          data: { setNumber: i + 1 },
        });
      }

      return this.findByIdAndUserId(sessionId, userId, tx);
    });
  }

  public async completeSession(
    sessionId: string,
    userId: string
  ): Promise<SessionWithHierarchy | null> {
    return prisma.$transaction(async (tx) => {
      const session = await this.findByIdAndUserId(sessionId, userId, tx);
      if (!session) return null;

      if (session.status !== 'IN_PROGRESS') {
        throw new Error(`INVALID_STATE_TRANSITION_${session.status}`);
      }

      await tx.workoutSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          abandonedAt: null,
        },
      });

      return this.findByIdAndUserId(sessionId, userId, tx);
    });
  }

  public async abandonSession(
    sessionId: string,
    userId: string
  ): Promise<SessionWithHierarchy | null> {
    return prisma.$transaction(async (tx) => {
      const session = await this.findByIdAndUserId(sessionId, userId, tx);
      if (!session) return null;

      if (session.status !== 'IN_PROGRESS') {
        throw new Error(`INVALID_STATE_TRANSITION_${session.status}`);
      }

      await tx.workoutSession.update({
        where: { id: sessionId },
        data: {
          status: 'ABANDONED',
          abandonedAt: new Date(),
          completedAt: null,
        },
      });

      return this.findByIdAndUserId(sessionId, userId, tx);
    });
  }
}

export const workoutSessionRepository = new WorkoutSessionRepository();
