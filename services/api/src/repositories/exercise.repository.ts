import { prisma } from '../config/prisma';
import { Exercise, Prisma } from '@prisma/client';

export interface ExerciseFilterOptions {
  search?: string;
  muscleGroup?: string;
  equipment?: string;
  page: number;
  limit: number;
}

export class ExerciseRepository {
  public async findAll(
    options: ExerciseFilterOptions,
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ items: Exercise[]; total: number }> {
    const where: Prisma.ExerciseWhereInput = {
      isActive: true,
    };

    if (options.search && options.search.trim() !== '') {
      where.OR = [
        { name: { contains: options.search.trim(), mode: 'insensitive' } },
        { description: { contains: options.search.trim(), mode: 'insensitive' } },
      ];
    }

    if (options.muscleGroup && options.muscleGroup.trim() !== '') {
      where.muscleGroup = { equals: options.muscleGroup.trim(), mode: 'insensitive' };
    }

    if (options.equipment && options.equipment.trim() !== '') {
      where.equipment = { equals: options.equipment.trim(), mode: 'insensitive' };
    }

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      tx.exercise.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: options.limit,
      }),
      tx.exercise.count({ where }),
    ]);

    return { items, total };
  }

  public async findById(id: string, tx: Prisma.TransactionClient = prisma): Promise<Exercise | null> {
    return tx.exercise.findUnique({
      where: { id },
    });
  }
}

export const exerciseRepository = new ExerciseRepository();
