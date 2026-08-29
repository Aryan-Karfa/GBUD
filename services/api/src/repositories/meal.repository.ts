import { prisma } from '../config/prisma';
import { Meal, MealFoodEntry, Prisma, MealType } from '@prisma/client';
import {
  CreateMealInput,
  UpdateMealInput,
  AddMealFoodEntryInput,
  UpdateMealFoodEntryInput,
  ProgressDateRangeInput,
} from '@gbud/validation';
import { foodRepository } from './food.repository';
import { calculateNutritionForQuantity } from '../modules/fuel/nutrition.calculator';

export type MealWithEntriesPayload = Meal & {
  entries: MealFoodEntry[];
};

export class MealRepository {
  private readonly defaultInclude = {
    entries: {
      orderBy: { createdAt: 'asc' as const },
    },
  };

  public async createMeal(
    userId: string,
    data: CreateMealInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload> {
    const meal = await tx.meal.create({
      data: {
        userId,
        name: data.name,
        mealDate: new Date(data.mealDate),
        mealType: (data.mealType as MealType) || null,
      },
      include: this.defaultInclude,
    });
    return meal;
  }

  public async findByIdAndUserId(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload | null> {
    return tx.meal.findFirst({
      where: { id, userId },
      include: this.defaultInclude,
    });
  }

  public async findAllByUserId(
    userId: string,
    options?: { page?: number; limit?: number; mealDate?: string },
    tx: Prisma.TransactionClient = prisma
  ): Promise<{ items: MealWithEntriesPayload[]; total: number }> {
    const where: Prisma.MealWhereInput = {
      userId,
      ...(options?.mealDate ? { mealDate: new Date(options.mealDate) } : {}),
    };

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      tx.meal.findMany({
        where,
        orderBy: [{ mealDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: this.defaultInclude,
      }),
      tx.meal.count({ where }),
    ]);

    return { items, total };
  }

  public async updateMeal(
    id: string,
    userId: string,
    data: UpdateMealInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload | null> {
    const existing = await this.findByIdAndUserId(id, userId, tx);
    if (!existing) return null;

    return tx.meal.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.mealDate !== undefined && { mealDate: new Date(data.mealDate) }),
        ...(data.mealType !== undefined && { mealType: data.mealType as MealType }),
      },
      include: this.defaultInclude,
    });
  }

  public async deleteMeal(
    id: string,
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<boolean> {
    const existing = await this.findByIdAndUserId(id, userId, tx);
    if (!existing) return false;

    await tx.meal.delete({ where: { id } });
    return true;
  }

  public async addFoodEntry(
    mealId: string,
    userId: string,
    data: AddMealFoodEntryInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload | null> {
    return prisma.$transaction(async (innerTx) => {
      const meal = await this.findByIdAndUserId(mealId, userId, innerTx);
      if (!meal) return null;

      const food = await foodRepository.findById(data.foodId, userId, innerTx);
      if (!food) {
        throw new Error('FOOD_NOT_FOUND');
      }

      // Enforce strict unit matching (No conversion engine)
      if (data.unit.trim().toLowerCase() !== food.servingUnit.trim().toLowerCase()) {
        throw new Error('UNIT_MISMATCH');
      }

      const scaled = calculateNutritionForQuantity(
        {
          servingSize: food.servingSize,
          calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbohydrates,
          fat: food.fat,
          fiber: food.fiber,
        },
        data.quantity
      );

      await innerTx.mealFoodEntry.create({
        data: {
          mealId,
          foodId: food.id,
          foodNameSnapshot: food.name,
          quantity: data.quantity,
          unit: food.servingUnit,
          servingSizeSnapshot: food.servingSize,
          servingUnitSnapshot: food.servingUnit,
          caloriesPerServingSnapshot: food.calories,
          proteinPerServingSnapshot: food.protein,
          carbohydratesPerServingSnapshot: food.carbohydrates,
          fatPerServingSnapshot: food.fat,
          fiberPerServingSnapshot: food.fiber,
          caloriesSnapshot: scaled.calories,
          proteinSnapshot: scaled.protein,
          carbohydratesSnapshot: scaled.carbohydrates,
          fatSnapshot: scaled.fat,
          fiberSnapshot: scaled.fiber,
        },
      });

      return this.findByIdAndUserId(mealId, userId, innerTx);
    });
  }

  public async updateFoodEntry(
    mealId: string,
    userId: string,
    entryId: string,
    data: UpdateMealFoodEntryInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload | null> {
    return prisma.$transaction(async (innerTx) => {
      const meal = await this.findByIdAndUserId(mealId, userId, innerTx);
      if (!meal) return null;

      const entry = meal.entries.find((e) => e.id === entryId);
      if (!entry) return null;

      if (data.unit && data.unit.trim().toLowerCase() !== entry.servingUnitSnapshot.trim().toLowerCase()) {
        throw new Error('UNIT_MISMATCH');
      }

      const scaled = calculateNutritionForQuantity(
        {
          servingSize: entry.servingSizeSnapshot,
          calories: entry.caloriesPerServingSnapshot,
          protein: entry.proteinPerServingSnapshot,
          carbohydrates: entry.carbohydratesPerServingSnapshot,
          fat: entry.fatPerServingSnapshot,
          fiber: entry.fiberPerServingSnapshot,
        },
        data.quantity
      );

      await innerTx.mealFoodEntry.update({
        where: { id: entryId },
        data: {
          quantity: data.quantity,
          caloriesSnapshot: scaled.calories,
          proteinSnapshot: scaled.protein,
          carbohydratesSnapshot: scaled.carbohydrates,
          fatSnapshot: scaled.fat,
          fiberSnapshot: scaled.fiber,
        },
      });

      return this.findByIdAndUserId(mealId, userId, innerTx);
    });
  }

  public async deleteFoodEntry(
    mealId: string,
    userId: string,
    entryId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload | null> {
    return prisma.$transaction(async (innerTx) => {
      const meal = await this.findByIdAndUserId(mealId, userId, innerTx);
      if (!meal) return null;

      const entry = meal.entries.find((e) => e.id === entryId);
      if (!entry) return null;

      await innerTx.mealFoodEntry.delete({ where: { id: entryId } });

      return this.findByIdAndUserId(mealId, userId, innerTx);
    });
  }

  public async getDailyMealsForDate(
    userId: string,
    dateStr: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload[]> {
    const dateObj = new Date(dateStr);
    return tx.meal.findMany({
      where: {
        userId,
        mealDate: dateObj,
      },
      orderBy: { createdAt: 'asc' },
      include: this.defaultInclude,
    });
  }

  public async getDailyMealsForRange(
    userId: string,
    options?: ProgressDateRangeInput,
    tx: Prisma.TransactionClient = prisma
  ): Promise<MealWithEntriesPayload[]> {
    const where: Prisma.MealWhereInput = {
      userId,
      ...(options?.from || options?.to
        ? {
            mealDate: {
              ...(options.from ? { gte: new Date(options.from) } : {}),
              ...(options.to ? { lte: new Date(options.to) } : {}),
            },
          }
        : {}),
    };

    return tx.meal.findMany({
      where,
      orderBy: [{ mealDate: 'desc' }, { createdAt: 'asc' }],
      include: this.defaultInclude,
    });
  }
}

export const mealRepository = new MealRepository();
