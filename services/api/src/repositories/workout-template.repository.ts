import { prisma } from '../config/prisma';
import { WorkoutTemplate, WorkoutTemplateExercise, Prisma } from '@prisma/client';

export type TemplateWithExercises = WorkoutTemplate & {
  templateExercises: (WorkoutTemplateExercise & {
    exercise: Prisma.ExerciseGetPayload<{}>;
  })[];
};

export class WorkoutTemplateRepository {
  public async create(
    userId: string,
    data: { name: string; description?: string },
    tx: Prisma.TransactionClient = prisma
  ): Promise<TemplateWithExercises> {
    return tx.workoutTemplate.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  }

  public async findAllByUserId(
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<TemplateWithExercises[]> {
    return tx.workoutTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  }

  public async findByIdAndUserId(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<TemplateWithExercises | null> {
    return tx.workoutTemplate.findFirst({
      where: { id, userId },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  }

  public async update(
    id: string,
    userId: string,
    data: { name?: string; description?: string },
    tx: Prisma.TransactionClient = prisma
  ): Promise<TemplateWithExercises | null> {
    const template = await this.findByIdAndUserId(id, userId, tx);
    if (!template) return null;

    return tx.workoutTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        templateExercises: {
          orderBy: { order: 'asc' },
          include: { exercise: true },
        },
      },
    });
  }

  public async delete(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<boolean> {
    const template = await this.findByIdAndUserId(id, userId, tx);
    if (!template) return false;

    await tx.workoutTemplate.delete({
      where: { id },
    });
    return true;
  }

  public async addExercise(
    templateId: string,
    userId: string,
    exerciseId: string,
    notes?: string
  ): Promise<TemplateWithExercises | null> {
    return prisma.$transaction(async (tx) => {
      const template = await this.findByIdAndUserId(templateId, userId, tx);
      if (!template) return null;

      const exercise = await tx.exercise.findUnique({
        where: { id: exerciseId },
      });
      if (!exercise || !exercise.isActive) return null;

      const existing = await tx.workoutTemplateExercise.findUnique({
        where: {
          workoutTemplateId_exerciseId: {
            workoutTemplateId: templateId,
            exerciseId,
          },
        },
      });
      if (existing) {
        throw new Error('DUPLICATE_EXERCISE_IN_TEMPLATE');
      }

      const maxOrderResult = await tx.workoutTemplateExercise.aggregate({
        where: { workoutTemplateId: templateId },
        _max: { order: true },
      });

      const nextOrder = (maxOrderResult._max.order ?? 0) + 1;

      await tx.workoutTemplateExercise.create({
        data: {
          workoutTemplateId: templateId,
          exerciseId,
          order: nextOrder,
          notes,
        },
      });

      return this.findByIdAndUserId(templateId, userId, tx);
    });
  }

  public async removeExercise(
    templateId: string,
    userId: string,
    templateExerciseId: string
  ): Promise<TemplateWithExercises | null> {
    return prisma.$transaction(async (tx) => {
      const template = await this.findByIdAndUserId(templateId, userId, tx);
      if (!template) return null;

      const item = await tx.workoutTemplateExercise.findFirst({
        where: { id: templateExerciseId, workoutTemplateId: templateId },
      });
      if (!item) return null;

      await tx.workoutTemplateExercise.delete({
        where: { id: templateExerciseId },
      });

      const remainingItems = await tx.workoutTemplateExercise.findMany({
        where: { workoutTemplateId: templateId },
        orderBy: { order: 'asc' },
      });

      for (let i = 0; i < remainingItems.length; i++) {
        await tx.workoutTemplateExercise.update({
          where: { id: remainingItems[i].id },
          data: { order: i + 1 },
        });
      }

      return this.findByIdAndUserId(templateId, userId, tx);
    });
  }

  public async reorderExercisesAtomic(
    templateId: string,
    userId: string,
    orderedTemplateExerciseIds: string[]
  ): Promise<TemplateWithExercises | null> {
    return prisma.$transaction(async (tx) => {
      const template = await this.findByIdAndUserId(templateId, userId, tx);
      if (!template) return null;

      const existingItems = await tx.workoutTemplateExercise.findMany({
        where: { workoutTemplateId: templateId },
      });

      const existingIds = new Set(existingItems.map((item) => item.id));

      if (
        orderedTemplateExerciseIds.length !== existingItems.length ||
        !orderedTemplateExerciseIds.every((id) => existingIds.has(id))
      ) {
        throw new Error('INVALID_REORDER_IDS');
      }

      for (let i = 0; i < orderedTemplateExerciseIds.length; i++) {
        await tx.workoutTemplateExercise.update({
          where: { id: orderedTemplateExerciseIds[i] },
          data: { order: i + 1 },
        });
      }

      return this.findByIdAndUserId(templateId, userId, tx);
    });
  }
}

export const workoutTemplateRepository = new WorkoutTemplateRepository();
