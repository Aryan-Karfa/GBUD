import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fuelService } from '../features/fuel/services/fuel.service';
import { apiClient } from '../api/client';
import { MealDTO, MealFoodEntryDTO } from '../features/fuel/fuel.types';

vi.mock('../api/client', () => ({
  apiClient: {
    fuel: {
      createMeal: vi.fn(),
      getMeal: vi.fn(),
      addMealFoodEntry: vi.fn(),
      updateMealFoodEntry: vi.fn(),
      deleteMealFoodEntry: vi.fn(),
      deleteMeal: vi.fn(),
    },
  },
}));

describe('Meal Lifecycle & Historical Food Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes full meal lifecycle with authoritative server recalculations', async () => {
    // 1. Create Meal
    const initialMeal: MealDTO = {
      id: 'meal-1',
      userId: 'user-1',
      name: 'Breakfast Bowl',
      mealDate: '2026-09-03',
      mealType: 'BREAKFAST',
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalFiber: 0,
      createdAt: '2026-09-03T08:00:00Z',
      updatedAt: '2026-09-03T08:00:00Z',
      entries: [],
    };
    (apiClient.fuel.createMeal as any).mockResolvedValue(initialMeal);

    const createdMeal = await fuelService.createMeal({
      name: 'Breakfast Bowl',
      mealDate: '2026-09-03',
      mealType: 'BREAKFAST',
    });
    expect(createdMeal.id).toBe('meal-1');
    expect(createdMeal.totalCalories).toBe(0);

    // 2. Add Food Entry (authoritative server calculates snapshot values)
    const oatsEntry: MealFoodEntryDTO = {
      id: 'entry-1',
      mealId: 'meal-1',
      foodId: 'food-oats',
      foodNameSnapshot: 'Rolled Oats',
      quantity: 50,
      unit: 'g',
      servingSizeSnapshot: 40,
      servingUnitSnapshot: 'g',
      caloriesPerServingSnapshot: 150,
      proteinPerServingSnapshot: 5,
      carbohydratesPerServingSnapshot: 27,
      fatPerServingSnapshot: 2.5,
      fiberPerServingSnapshot: 4,
      caloriesSnapshot: 187.5,
      proteinSnapshot: 6.25,
      carbohydratesSnapshot: 33.75,
      fatSnapshot: 3.125,
      fiberSnapshot: 5,
      createdAt: '2026-09-03T08:05:00Z',
      updatedAt: '2026-09-03T08:05:00Z',
    };

    const mealWithOats: MealDTO = {
      ...initialMeal,
      totalCalories: 187.5,
      totalProtein: 6.25,
      totalCarbohydrates: 33.75,
      totalFat: 3.125,
      totalFiber: 5,
      entries: [oatsEntry],
    };
    (apiClient.fuel.addMealFoodEntry as any).mockResolvedValue(mealWithOats);

    const afterAdd = await fuelService.addFoodToMeal('meal-1', {
      foodId: 'food-oats',
      quantity: 50,
      unit: 'g',
    });
    expect(afterAdd.entries.length).toBe(1);
    expect(afterAdd.entries[0].foodNameSnapshot).toBe('Rolled Oats');
    expect(afterAdd.totalCalories).toBe(187.5);

    // 3. Update Quantity (server recalculates authoritative totals)
    const updatedOatsEntry: MealFoodEntryDTO = {
      ...oatsEntry,
      quantity: 100,
      caloriesSnapshot: 375,
      proteinSnapshot: 12.5,
      carbohydratesSnapshot: 67.5,
      fatSnapshot: 6.25,
      fiberSnapshot: 10,
    };

    const mealWithMoreOats: MealDTO = {
      ...initialMeal,
      totalCalories: 375,
      totalProtein: 12.5,
      totalCarbohydrates: 67.5,
      totalFat: 6.25,
      totalFiber: 10,
      entries: [updatedOatsEntry],
    };
    (apiClient.fuel.updateMealFoodEntry as any).mockResolvedValue(mealWithMoreOats);

    const afterQuantityUpdate = await fuelService.updateMealFoodEntry('meal-1', 'entry-1', {
      quantity: 100,
    });
    expect(afterQuantityUpdate.entries[0].quantity).toBe(100);
    expect(afterQuantityUpdate.totalCalories).toBe(375);

    // 4. Remove Food Entry
    const mealEmpty: MealDTO = {
      ...initialMeal,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbohydrates: 0,
      totalFat: 0,
      totalFiber: 0,
      entries: [],
    };
    (apiClient.fuel.deleteMealFoodEntry as any).mockResolvedValue(mealEmpty);

    const afterRemove = await fuelService.removeMealFoodEntry('meal-1', 'entry-1');
    expect(afterRemove.entries.length).toBe(0);
    expect(afterRemove.totalCalories).toBe(0);

    // 5. Delete Meal
    (apiClient.fuel.deleteMeal as any).mockResolvedValue(null);
    const deleteResult = await fuelService.deleteMeal('meal-1');
    expect(deleteResult).toBeNull();
    expect(apiClient.fuel.deleteMeal).toHaveBeenCalledWith('meal-1');
  });

  it('preserves historical snapshot values even if catalog changes', async () => {
    // Historical meal entry with custom recipe snapshot
    const historicalEntry: MealFoodEntryDTO = {
      id: 'entry-old',
      mealId: 'meal-old',
      foodId: null, // Original food may even be deleted
      foodNameSnapshot: 'Grandma Homemade Chili',
      quantity: 250,
      unit: 'g',
      servingSizeSnapshot: 250,
      servingUnitSnapshot: 'g',
      caloriesPerServingSnapshot: 320,
      proteinPerServingSnapshot: 28,
      carbohydratesPerServingSnapshot: 30,
      fatPerServingSnapshot: 10,
      fiberPerServingSnapshot: 8,
      caloriesSnapshot: 320,
      proteinSnapshot: 28,
      carbohydratesSnapshot: 30,
      fatSnapshot: 10,
      fiberSnapshot: 8,
      createdAt: '2026-08-01T12:00:00Z',
      updatedAt: '2026-08-01T12:00:00Z',
    };

    const historicalMeal: MealDTO = {
      id: 'meal-old',
      userId: 'user-1',
      name: 'August Lunch',
      mealDate: '2026-08-01',
      mealType: 'LUNCH',
      totalCalories: 320,
      totalProtein: 28,
      totalCarbohydrates: 30,
      totalFat: 10,
      totalFiber: 8,
      createdAt: '2026-08-01T12:00:00Z',
      updatedAt: '2026-08-01T12:00:00Z',
      entries: [historicalEntry],
    };

    (apiClient.fuel.getMeal as any).mockResolvedValue(historicalMeal);

    const fetchedMeal = await fuelService.getMeal('meal-old');
    expect(fetchedMeal.entries[0].foodNameSnapshot).toBe('Grandma Homemade Chili');
    expect(fetchedMeal.entries[0].caloriesSnapshot).toBe(320);
    expect(fetchedMeal.entries[0].foodId).toBeNull(); // Immutable snapshot intact
  });
});
