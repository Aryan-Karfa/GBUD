import { prisma } from '../config/prisma';
import { Food, Prisma } from '@prisma/client';
import { FoodQueryInput, CreateFoodInput, UpdateFoodInput } from '@gbud/validation';

export class FoodRepository {
  public async findAll(
    userId: string,
    options: FoodQueryInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ items: Food[]; total: number }> {
    const where: Prisma.FoodWhereInput = {
      isActive: true,
      OR: [{ ownerId: null }, { ownerId: userId }],
      ...(options.search
        ? {
            OR: [
              { name: { contains: options.search, mode: 'insensitive' } },
              { description: { contains: options.search, mode: 'insensitive' } },
            ],
            // Still enforce ownership isolation
            AND: [{ OR: [{ ownerId: null }, { ownerId: userId }] }, { isActive: true }],
          }
        : {}),
    };

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      tx.food.findMany({
        where,
        orderBy: [{ ownerId: 'asc' }, { name: 'asc' }],
        skip,
        take: options.limit,
      }),
      tx.food.count({ where }),
    ]);

    return { items, total };
  }

  public async findById(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<Food | null> {
    const food = await tx.food.findUnique({ where: { id } });
    if (!food || !food.isActive) return null;

    // Must be system food OR owned by requesting user
    if (food.ownerId !== null && food.ownerId !== userId) {
      return null;
    }

    return food;
  }

  public async createCustomFood(
    userId: string,
    data: CreateFoodInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<Food> {
    return tx.food.create({
      data: {
        name: data.name,
        description: data.description || null,
        servingSize: data.servingSize,
        servingUnit: data.servingUnit,
        calories: data.calories,
        protein: data.protein,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
        fiber: data.fiber ?? null,
        ownerId: userId,
        isActive: true,
      },
    });
  }

  public async updateCustomFood(
    id: string,
    userId: string,
    data: UpdateFoodInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<Food | null> {
    const food = await this.findById(id, userId, tx);
    if (!food) return null;

    // Reject system food modifications
    if (food.ownerId === null) {
      throw new Error('SYSTEM_FOOD_IMMUTABLE');
    }

    return tx.food.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.servingSize !== undefined && { servingSize: data.servingSize }),
        ...(data.servingUnit !== undefined && { servingUnit: data.servingUnit }),
        ...(data.calories !== undefined && { calories: data.calories }),
        ...(data.protein !== undefined && { protein: data.protein }),
        ...(data.carbohydrates !== undefined && { carbohydrates: data.carbohydrates }),
        ...(data.fat !== undefined && { fat: data.fat }),
        ...(data.fiber !== undefined && { fiber: data.fiber }),
      },
    });
  }

  public async softDeleteCustomFood(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<Food | null> {
    const food = await this.findById(id, userId, tx);
    if (!food) return null;

    // Reject system food deletions
    if (food.ownerId === null) {
      throw new Error('SYSTEM_FOOD_IMMUTABLE');
    }

    return tx.food.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const foodRepository = new FoodRepository();
