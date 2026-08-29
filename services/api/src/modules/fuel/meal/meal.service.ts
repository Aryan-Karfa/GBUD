import {
  CreateMealInput,
  UpdateMealInput,
  AddMealFoodEntryInput,
  UpdateMealFoodEntryInput,
  ProgressDateRangeInput,
} from '@gbud/validation';
import {
  MealDTO,
  MealFoodEntryDTO,
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  PaginatedResponseData,
} from '@gbud/types';
import { mealRepository, MealWithEntriesPayload } from '../../../repositories/meal.repository';
import { nutritionTargetRepository } from '../../../repositories/nutrition-target.repository';
import { AppError } from '../../../utils/app-error';
import { MealFoodEntry } from '@prisma/client';

export class MealService {
  private mapEntryToDTO(entry: MealFoodEntry): MealFoodEntryDTO {
    return {
      id: entry.id,
      mealId: entry.mealId,
      foodId: entry.foodId,
      foodNameSnapshot: entry.foodNameSnapshot,
      quantity: entry.quantity,
      unit: entry.unit,
      servingSizeSnapshot: entry.servingSizeSnapshot,
      servingUnitSnapshot: entry.servingUnitSnapshot,
      caloriesPerServingSnapshot: entry.caloriesPerServingSnapshot,
      proteinPerServingSnapshot: entry.proteinPerServingSnapshot,
      carbohydratesPerServingSnapshot: entry.carbohydratesPerServingSnapshot,
      fatPerServingSnapshot: entry.fatPerServingSnapshot,
      fiberPerServingSnapshot: entry.fiberPerServingSnapshot,
      caloriesSnapshot: entry.caloriesSnapshot,
      proteinSnapshot: entry.proteinSnapshot,
      carbohydratesSnapshot: entry.carbohydratesSnapshot,
      fatSnapshot: entry.fatSnapshot,
      fiberSnapshot: entry.fiberSnapshot,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  private mapMealToDTO(meal: MealWithEntriesPayload): MealDTO {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbohydrates = 0;
    let totalFat = 0;
    let totalFiberSum = 0;
    let hasFiber = false;

    for (const e of meal.entries) {
      totalCalories += e.caloriesSnapshot;
      totalProtein += e.proteinSnapshot;
      totalCarbohydrates += e.carbohydratesSnapshot;
      totalFat += e.fatSnapshot;
      if (e.fiberSnapshot !== null && e.fiberSnapshot !== undefined) {
        totalFiberSum += e.fiberSnapshot;
        hasFiber = true;
      }
    }

    const round = (num: number) => Math.round(num * 100) / 100;

    return {
      id: meal.id,
      userId: meal.userId,
      name: meal.name,
      mealDate: meal.mealDate.toISOString().split('T')[0],
      mealType: meal.mealType as any,
      totalCalories: round(totalCalories),
      totalProtein: round(totalProtein),
      totalCarbohydrates: round(totalCarbohydrates),
      totalFat: round(totalFat),
      totalFiber: hasFiber ? round(totalFiberSum) : null,
      createdAt: meal.createdAt.toISOString(),
      updatedAt: meal.updatedAt.toISOString(),
      entries: meal.entries.map((e) => this.mapEntryToDTO(e)),
    };
  }

  public async createMeal(userId: string, input: CreateMealInput): Promise<MealDTO> {
    const meal = await mealRepository.createMeal(userId, input);
    return this.mapMealToDTO(meal);
  }

  public async getMealById(id: string, userId: string): Promise<MealDTO> {
    const meal = await mealRepository.findByIdAndUserId(id, userId);
    if (!meal) {
      throw AppError.notFound('Meal not found');
    }
    return this.mapMealToDTO(meal);
  }

  public async listMeals(
    userId: string,
    query: { page?: number; limit?: number; mealDate?: string }
  ): Promise<PaginatedResponseData<MealDTO>> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const { items, total } = await mealRepository.findAllByUserId(userId, {
      page,
      limit,
      mealDate: query.mealDate,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((m) => this.mapMealToDTO(m)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  public async updateMeal(id: string, userId: string, input: UpdateMealInput): Promise<MealDTO> {
    const updated = await mealRepository.updateMeal(id, userId, input);
    if (!updated) {
      throw AppError.notFound('Meal not found');
    }
    return this.mapMealToDTO(updated);
  }

  public async deleteMeal(id: string, userId: string): Promise<void> {
    const deleted = await mealRepository.deleteMeal(id, userId);
    if (!deleted) {
      throw AppError.notFound('Meal not found');
    }
  }

  public async addFoodEntry(
    mealId: string,
    userId: string,
    input: AddMealFoodEntryInput
  ): Promise<MealDTO> {
    try {
      const updated = await mealRepository.addFoodEntry(mealId, userId, input);
      if (!updated) {
        throw AppError.notFound('Meal not found');
      }
      return this.mapMealToDTO(updated);
    } catch (error: any) {
      if (error.message === 'FOOD_NOT_FOUND') {
        throw AppError.notFound('Food item not found');
      }
      if (error.message === 'UNIT_MISMATCH') {
        throw AppError.validationError('Unit mismatch: entry unit must equal food servingUnit', [
          { field: 'unit', message: 'Entry unit does not match food servingUnit' },
        ]);
      }
      throw error;
    }
  }

  public async updateFoodEntry(
    mealId: string,
    userId: string,
    entryId: string,
    input: UpdateMealFoodEntryInput
  ): Promise<MealDTO> {
    try {
      const updated = await mealRepository.updateFoodEntry(mealId, userId, entryId, input);
      if (!updated) {
        throw AppError.notFound('Meal or food entry not found');
      }
      return this.mapMealToDTO(updated);
    } catch (error: any) {
      if (error.message === 'UNIT_MISMATCH') {
        throw AppError.validationError('Unit mismatch: entry unit must equal food servingUnitSnapshot', [
          { field: 'unit', message: 'Entry unit does not match food servingUnit' },
        ]);
      }
      throw error;
    }
  }

  public async deleteFoodEntry(mealId: string, userId: string, entryId: string): Promise<MealDTO> {
    const updated = await mealRepository.deleteFoodEntry(mealId, userId, entryId);
    if (!updated) {
      throw AppError.notFound('Meal or food entry not found');
    }
    return this.mapMealToDTO(updated);
  }

  public async getDailySummary(userId: string, dateStr: string): Promise<NutritionDailySummaryDTO> {
    const meals = await mealRepository.getDailyMealsForDate(userId, dateStr);

    let calories = 0;
    let protein = 0;
    let carbohydrates = 0;
    let fat = 0;
    let fiberSum = 0;
    let hasFiber = false;

    for (const meal of meals) {
      for (const e of meal.entries) {
        calories += e.caloriesSnapshot;
        protein += e.proteinSnapshot;
        carbohydrates += e.carbohydratesSnapshot;
        fat += e.fatSnapshot;
        if (e.fiberSnapshot !== null && e.fiberSnapshot !== undefined) {
          fiberSum += e.fiberSnapshot;
          hasFiber = true;
        }
      }
    }

    const round = (num: number) => Math.round(num * 100) / 100;

    return {
      date: dateStr,
      calories: round(calories),
      protein: round(protein),
      carbohydrates: round(carbohydrates),
      fat: round(fat),
      fiber: hasFiber ? round(fiberSum) : null,
      meals: meals.length,
    };
  }

  public async getNutritionHistory(
    userId: string,
    query: ProgressDateRangeInput
  ): Promise<NutritionDailySummaryDTO[]> {
    const meals = await mealRepository.getDailyMealsForRange(userId, query);

    const dateMap = new Map<string, { meals: MealWithEntriesPayload[] }>();

    for (const meal of meals) {
      const dStr = meal.mealDate.toISOString().split('T')[0];
      if (!dateMap.has(dStr)) {
        dateMap.set(dStr, { meals: [] });
      }
      dateMap.get(dStr)!.meals.push(meal);
    }

    const summaries: NutritionDailySummaryDTO[] = [];
    const round = (num: number) => Math.round(num * 100) / 100;

    for (const [date, data] of dateMap.entries()) {
      let calories = 0;
      let protein = 0;
      let carbohydrates = 0;
      let fat = 0;
      let fiberSum = 0;
      let hasFiber = false;

      for (const meal of data.meals) {
        for (const e of meal.entries) {
          calories += e.caloriesSnapshot;
          protein += e.proteinSnapshot;
          carbohydrates += e.carbohydratesSnapshot;
          fat += e.fatSnapshot;
          if (e.fiberSnapshot !== null && e.fiberSnapshot !== undefined) {
            fiberSum += e.fiberSnapshot;
            hasFiber = true;
          }
        }
      }

      summaries.push({
        date,
        calories: round(calories),
        protein: round(protein),
        carbohydrates: round(carbohydrates),
        fat: round(fat),
        fiber: hasFiber ? round(fiberSum) : null,
        meals: data.meals.length,
      });
    }

    return summaries.sort((a, b) => b.date.localeCompare(a.date));
  }

  public async getSummaryComparison(
    userId: string,
    dateStr: string
  ): Promise<NutritionTargetComparisonDTO> {
    const [actualSummary, currentTarget] = await Promise.all([
      this.getDailySummary(userId, dateStr),
      nutritionTargetRepository.findCurrentTargetForDate(userId, dateStr),
    ]);

    const actual = {
      calories: actualSummary.calories,
      protein: actualSummary.protein,
      carbohydrates: actualSummary.carbohydrates,
      fat: actualSummary.fat,
    };

    if (!currentTarget) {
      return {
        date: dateStr,
        actual,
        target: null,
        remaining: null,
      };
    }

    const target = {
      calories: currentTarget.calories,
      protein: currentTarget.protein,
      carbohydrates: currentTarget.carbohydrates,
      fat: currentTarget.fat,
    };

    const round = (num: number) => Math.round(num * 100) / 100;

    const remaining = {
      calories: round(target.calories - actual.calories),
      protein: round(target.protein - actual.protein),
      carbohydrates: round(target.carbohydrates - actual.carbohydrates),
      fat: round(target.fat - actual.fat),
    };

    return {
      date: dateStr,
      actual,
      target,
      remaining,
    };
  }
}

export const mealService = new MealService();
