import { prisma } from '../config/prisma';
import { Prisma, WorkoutSession, WorkoutSessionExercise, WorkoutSet, Exercise } from '@prisma/client';

export type ProgressSessionPayload = WorkoutSession & {
  sessionExercises: (WorkoutSessionExercise & {
    exercise: Exercise | null;
    sets: WorkoutSet[];
  })[];
};

export interface ProgressDateFilterOptions {
  from?: string;
  to?: string;
}

export class ProgressRepository {
  private buildDateFilter(options?: ProgressDateFilterOptions): Prisma.DateTimeFilter | undefined {
    if (!options?.from && !options?.to) return undefined;

    const filter: Prisma.DateTimeFilter = {};
    if (options.from) {
      filter.gte = new Date(options.from);
    }
    if (options.to) {
      // Set to end of day inclusive if only date is passed
      const toDate = new Date(options.to);
      if (options.to.length <= 10) {
        toDate.setHours(23, 59, 59, 999);
      }
      filter.lte = toDate;
    }
    return filter;
  }

  public async getCompletedSessions(
    userId: string,
    options?: ProgressDateFilterOptions,
    tx: Prisma.TransactionClient = prisma
  ): Promise<ProgressSessionPayload[]> {
    const startedAtFilter = this.buildDateFilter(options);

    return tx.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        ...(startedAtFilter ? { startedAt: startedAtFilter } : {}),
      },
      orderBy: { startedAt: 'asc' },
      include: {
        sessionExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  public async getAllSessions(
    userId: string,
    options?: ProgressDateFilterOptions,
    tx: Prisma.TransactionClient = prisma
  ): Promise<ProgressSessionPayload[]> {
    const startedAtFilter = this.buildDateFilter(options);

    return tx.workoutSession.findMany({
      where: {
        userId,
        status: { in: ['COMPLETED', 'ABANDONED'] },
        ...(startedAtFilter ? { startedAt: startedAtFilter } : {}),
      },
      orderBy: { startedAt: 'asc' },
      include: {
        sessionExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });
  }

  public async getExerciseSessionHistory(
    userId: string,
    exerciseId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ exerciseName: string; catalogExercise: Exercise | null; sessions: ProgressSessionPayload[] }> {
    // 1. Check if exercise exists in catalog
    const catalogExercise = await tx.exercise.findUnique({ where: { id: exerciseId } });

    const exerciseNameTarget = catalogExercise ? catalogExercise.name : null;

    // 2. Fetch completed sessions where user performed this exercise (either matching exerciseId or matching snapshot name)
    const sessions = await tx.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        sessionExercises: {
          some: {
            OR: [
              { exerciseId },
              ...(exerciseNameTarget ? [{ name: { equals: exerciseNameTarget, mode: 'insensitive' as const } }] : []),
            ],
          },
        },
      },
      orderBy: { startedAt: 'asc' },
      include: {
        sessionExercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });

    const displayName = catalogExercise ? catalogExercise.name : sessions[0]?.sessionExercises.find(se => se.exerciseId === exerciseId || se.name === exerciseNameTarget)?.name || 'Unknown Exercise';

    return {
      exerciseName: displayName,
      catalogExercise,
      sessions,
    };
  }
}

export const progressRepository = new ProgressRepository();
