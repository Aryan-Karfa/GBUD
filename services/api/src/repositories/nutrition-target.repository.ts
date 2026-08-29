import { prisma } from '../config/prisma';
import { NutritionTarget, Prisma } from '@prisma/client';
import { NutritionTargetInput, UpdateNutritionTargetInput } from '@gbud/validation';

export class NutritionTargetRepository {
  public async createTarget(
    userId: string,
    data: NutritionTargetInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<NutritionTarget> {
    const effectiveFromDate = new Date(data.effectiveFrom);

    const existing = await tx.nutritionTarget.findUnique({
      where: {
        userId_effectiveFrom: {
          userId,
          effectiveFrom: effectiveFromDate,
        },
      },
    });

    if (existing) {
      throw new Error('DUPLICATE_TARGET_DATE');
    }

    return tx.nutritionTarget.create({
      data: {
        userId,
        calories: data.calories,
        protein: data.protein,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
        effectiveFrom: effectiveFromDate,
      },
    });
  }

  public async findCurrentTargetForDate(
    userId: string,
    dateStr: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<NutritionTarget | null> {
    const queryDate = new Date(dateStr);

    return tx.nutritionTarget.findFirst({
      where: {
        userId,
        effectiveFrom: { lte: queryDate },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  public async findAllTargetsByUserId(
    userId: string,
    options?: { page?: number; limit?: number },
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ items: NutritionTarget[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NutritionTargetWhereInput = { userId };

    const [items, total] = await Promise.all([
      tx.nutritionTarget.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
        skip,
        take: limit,
      }),
      tx.nutritionTarget.count({ where }),
    ]);

    return { items, total };
  }

  public async findByIdAndUserId(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<NutritionTarget | null> {
    return tx.nutritionTarget.findFirst({
      where: { id, userId },
    });
  }

  public async updateTarget(
    id: string,
    userId: string,
    data: UpdateNutritionTargetInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<NutritionTarget | null> {
    const target = await this.findByIdAndUserId(id, userId, tx);
    if (!target) return null;

    // Check if effectiveFrom is in the past or today (immutable once effective)
    const todayStr = new Date().toISOString().split('T')[0];
    const targetEffStr = target.effectiveFrom.toISOString().split('T')[0];

    if (targetEffStr <= todayStr) {
      throw new Error('HISTORICAL_TARGET_IMMUTABLE');
    }

    return tx.nutritionTarget.update({
      where: { id },
      data: {
        ...(data.calories !== undefined && { calories: data.calories }),
        ...(data.protein !== undefined && { protein: data.protein }),
        ...(data.carbohydrates !== undefined && { carbohydrates: data.carbohydrates }),
        ...(data.fat !== undefined && { fat: data.fat }),
      },
    });
  }

  public async deleteTarget(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<boolean> {
    const target = await this.findByIdAndUserId(id, userId, tx);
    if (!target) return false;

    await tx.nutritionTarget.delete({ where: { id } });
    return true;
  }
}

export const nutritionTargetRepository = new NutritionTargetRepository();
