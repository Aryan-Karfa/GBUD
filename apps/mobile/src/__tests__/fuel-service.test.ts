import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fuelService } from '../features/fuel/services/fuel.service';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    fuel: {
      listFoods: vi.fn(),
      getFood: vi.fn(),
      createFood: vi.fn(),
      updateFood: vi.fn(),
      deleteFood: vi.fn(),
      listMeals: vi.fn(),
      getMeal: vi.fn(),
      createMeal: vi.fn(),
      updateMeal: vi.fn(),
      deleteMeal: vi.fn(),
      addMealFoodEntry: vi.fn(),
      updateMealFoodEntry: vi.fn(),
      deleteMealFoodEntry: vi.fn(),
      getCurrentNutritionTarget: vi.fn(),
      listNutritionTargets: vi.fn(),
      createNutritionTarget: vi.fn(),
      updateNutritionTarget: vi.fn(),
      deleteNutritionTarget: vi.fn(),
      getFuelSummary: vi.fn(),
      compareFuelSummary: vi.fn(),
      getFuelHistory: vi.fn(),
    },
  },
}));

describe('FuelService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Food Operations', () => {
    it('delegates listFoods to apiClient.fuel.listFoods', async () => {
      const mockResult = {
        items: [{ id: 'food-1', name: 'Oatmeal', calories: 150 }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      (apiClient.fuel.listFoods as any).mockResolvedValue(mockResult);

      const query = { search: 'Oat', page: 1, limit: 20 };
      const res = await fuelService.listFoods(query);

      expect(apiClient.fuel.listFoods).toHaveBeenCalledWith(query);
      expect(res).toEqual(mockResult);
    });

    it('delegates getFood to apiClient.fuel.getFood', async () => {
      const mockFood = { id: 'food-1', name: 'Chicken Breast' };
      (apiClient.fuel.getFood as any).mockResolvedValue(mockFood);

      const res = await fuelService.getFood('food-1');
      expect(apiClient.fuel.getFood).toHaveBeenCalledWith('food-1');
      expect(res).toEqual(mockFood);
    });

    it('delegates createCustomFood to apiClient.fuel.createFood', async () => {
      const input = {
        name: 'Protein Shake',
        servingSize: 1,
        servingUnit: 'scoop',
        calories: 120,
        protein: 24,
        carbohydrates: 3,
        fat: 1.5,
      };
      const mockCreated = { id: 'food-2', ...input, isCustom: true };
      (apiClient.fuel.createFood as any).mockResolvedValue(mockCreated);

      const res = await fuelService.createCustomFood(input);
      expect(apiClient.fuel.createFood).toHaveBeenCalledWith(input);
      expect(res).toEqual(mockCreated);
    });

    it('delegates updateCustomFood to apiClient.fuel.updateFood', async () => {
      const input = { calories: 130 };
      const mockUpdated = { id: 'food-2', name: 'Protein Shake', calories: 130 };
      (apiClient.fuel.updateFood as any).mockResolvedValue(mockUpdated);

      const res = await fuelService.updateCustomFood('food-2', input);
      expect(apiClient.fuel.updateFood).toHaveBeenCalledWith('food-2', input);
      expect(res).toEqual(mockUpdated);
    });

    it('delegates deactivateCustomFood to apiClient.fuel.deleteFood', async () => {
      (apiClient.fuel.deleteFood as any).mockResolvedValue(null);

      const res = await fuelService.deactivateCustomFood('food-2');
      expect(apiClient.fuel.deleteFood).toHaveBeenCalledWith('food-2');
      expect(res).toBeNull();
    });
  });

  describe('Meal Operations', () => {
    it('delegates listMeals to apiClient.fuel.listMeals', async () => {
      const mockResult = {
        items: [{ id: 'm-1', name: 'Lunch', mealDate: '2026-09-03' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      (apiClient.fuel.listMeals as any).mockResolvedValue(mockResult);

      const query = { mealDate: '2026-09-03' };
      const res = await fuelService.listMeals(query);
      expect(apiClient.fuel.listMeals).toHaveBeenCalledWith(query);
      expect(res).toEqual(mockResult);
    });

    it('delegates getMeal to apiClient.fuel.getMeal', async () => {
      const mockMeal = { id: 'm-1', name: 'Lunch', entries: [] };
      (apiClient.fuel.getMeal as any).mockResolvedValue(mockMeal);

      const res = await fuelService.getMeal('m-1');
      expect(apiClient.fuel.getMeal).toHaveBeenCalledWith('m-1');
      expect(res).toEqual(mockMeal);
    });

    it('delegates createMeal to apiClient.fuel.createMeal', async () => {
      const input = { name: 'Dinner', mealDate: '2026-09-03', mealType: 'DINNER' as const };
      const mockCreated = { id: 'm-2', ...input, totalCalories: 0, entries: [] };
      (apiClient.fuel.createMeal as any).mockResolvedValue(mockCreated);

      const res = await fuelService.createMeal(input);
      expect(apiClient.fuel.createMeal).toHaveBeenCalledWith(input);
      expect(res).toEqual(mockCreated);
    });

    it('delegates updateMeal to apiClient.fuel.updateMeal', async () => {
      const input = { name: 'Late Dinner' };
      const mockUpdated = { id: 'm-2', name: 'Late Dinner' };
      (apiClient.fuel.updateMeal as any).mockResolvedValue(mockUpdated);

      const res = await fuelService.updateMeal('m-2', input);
      expect(apiClient.fuel.updateMeal).toHaveBeenCalledWith('m-2', input);
      expect(res).toEqual(mockUpdated);
    });

    it('delegates deleteMeal to apiClient.fuel.deleteMeal', async () => {
      (apiClient.fuel.deleteMeal as any).mockResolvedValue(null);

      const res = await fuelService.deleteMeal('m-2');
      expect(apiClient.fuel.deleteMeal).toHaveBeenCalledWith('m-2');
      expect(res).toBeNull();
    });
  });

  describe('Meal Entry Operations', () => {
    it('delegates addFoodToMeal to apiClient.fuel.addMealFoodEntry', async () => {
      const input = { foodId: 'food-1', quantity: 2, unit: 'scoop' };
      const mockUpdatedMeal = { id: 'm-1', entries: [{ id: 'e-1', foodNameSnapshot: 'Protein Shake' }] };
      (apiClient.fuel.addMealFoodEntry as any).mockResolvedValue(mockUpdatedMeal);

      const res = await fuelService.addFoodToMeal('m-1', input);
      expect(apiClient.fuel.addMealFoodEntry).toHaveBeenCalledWith('m-1', input);
      expect(res).toEqual(mockUpdatedMeal);
    });

    it('delegates updateMealFoodEntry to apiClient.fuel.updateMealFoodEntry', async () => {
      const input = { quantity: 3 };
      const mockUpdatedMeal = { id: 'm-1', entries: [{ id: 'e-1', quantity: 3 }] };
      (apiClient.fuel.updateMealFoodEntry as any).mockResolvedValue(mockUpdatedMeal);

      const res = await fuelService.updateMealFoodEntry('m-1', 'e-1', input);
      expect(apiClient.fuel.updateMealFoodEntry).toHaveBeenCalledWith('m-1', 'e-1', input);
      expect(res).toEqual(mockUpdatedMeal);
    });

    it('delegates removeMealFoodEntry to apiClient.fuel.deleteMealFoodEntry', async () => {
      const mockUpdatedMeal = { id: 'm-1', entries: [] };
      (apiClient.fuel.deleteMealFoodEntry as any).mockResolvedValue(mockUpdatedMeal);

      const res = await fuelService.removeMealFoodEntry('m-1', 'e-1');
      expect(apiClient.fuel.deleteMealFoodEntry).toHaveBeenCalledWith('m-1', 'e-1');
      expect(res).toEqual(mockUpdatedMeal);
    });
  });

  describe('Nutrition Target Operations', () => {
    it('delegates getCurrentNutritionTarget to apiClient.fuel.getCurrentNutritionTarget', async () => {
      const mockTarget = { id: 't-1', calories: 2500, effectiveFrom: '2026-09-01' };
      (apiClient.fuel.getCurrentNutritionTarget as any).mockResolvedValue(mockTarget);

      const res = await fuelService.getCurrentNutritionTarget('2026-09-03');
      expect(apiClient.fuel.getCurrentNutritionTarget).toHaveBeenCalledWith('2026-09-03');
      expect(res).toEqual(mockTarget);
    });

    it('delegates listNutritionTargets to apiClient.fuel.listNutritionTargets', async () => {
      const mockResult = {
        items: [{ id: 't-1', calories: 2500 }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      (apiClient.fuel.listNutritionTargets as any).mockResolvedValue(mockResult);

      const res = await fuelService.listNutritionTargets({ page: 1 });
      expect(apiClient.fuel.listNutritionTargets).toHaveBeenCalledWith({ page: 1 });
      expect(res).toEqual(mockResult);
    });

    it('delegates createNutritionTarget to apiClient.fuel.createNutritionTarget', async () => {
      const input = {
        effectiveFrom: '2026-09-05',
        calories: 2600,
        protein: 190,
        carbohydrates: 280,
        fat: 75,
      };
      const mockTarget = { id: 't-2', ...input };
      (apiClient.fuel.createNutritionTarget as any).mockResolvedValue(mockTarget);

      const res = await fuelService.createNutritionTarget(input);
      expect(apiClient.fuel.createNutritionTarget).toHaveBeenCalledWith(input);
      expect(res).toEqual(mockTarget);
    });

    it('delegates updateNutritionTarget to apiClient.fuel.updateNutritionTarget', async () => {
      const input = { calories: 2700 };
      const mockTarget = { id: 't-2', calories: 2700 };
      (apiClient.fuel.updateNutritionTarget as any).mockResolvedValue(mockTarget);

      const res = await fuelService.updateNutritionTarget('t-2', input);
      expect(apiClient.fuel.updateNutritionTarget).toHaveBeenCalledWith('t-2', input);
      expect(res).toEqual(mockTarget);
    });

    it('delegates deleteNutritionTarget to apiClient.fuel.deleteNutritionTarget', async () => {
      (apiClient.fuel.deleteNutritionTarget as any).mockResolvedValue(null);

      const res = await fuelService.deleteNutritionTarget('t-2');
      expect(apiClient.fuel.deleteNutritionTarget).toHaveBeenCalledWith('t-2');
      expect(res).toBeNull();
    });
  });

  describe('Daily Nutrition & History Operations', () => {
    it('delegates getDailySummary to apiClient.fuel.getFuelSummary', async () => {
      const mockSummary = { date: '2026-09-03', calories: 2100, protein: 160, carbohydrates: 220, fat: 65, meals: 3 };
      (apiClient.fuel.getFuelSummary as any).mockResolvedValue(mockSummary);

      const res = await fuelService.getDailySummary('2026-09-03');
      expect(apiClient.fuel.getFuelSummary).toHaveBeenCalledWith('2026-09-03');
      expect(res).toEqual(mockSummary);
    });

    it('delegates compareFuelSummary to apiClient.fuel.compareFuelSummary', async () => {
      const mockCompare = {
        date: '2026-09-03',
        actual: { calories: 2100, protein: 160, carbohydrates: 220, fat: 65 },
        target: { calories: 2500, protein: 180, carbohydrates: 250, fat: 70 },
        remaining: { calories: 400, protein: 20, carbohydrates: 30, fat: 5 },
      };
      (apiClient.fuel.compareFuelSummary as any).mockResolvedValue(mockCompare);

      const res = await fuelService.compareFuelSummary('2026-09-03');
      expect(apiClient.fuel.compareFuelSummary).toHaveBeenCalledWith('2026-09-03');
      expect(res).toEqual(mockCompare);
    });

    it('delegates getFuelHistory to apiClient.fuel.getFuelHistory', async () => {
      const mockHistory = [
        { date: '2026-09-02', calories: 2200, meals: 3 },
        { date: '2026-09-03', calories: 2100, meals: 3 },
      ];
      (apiClient.fuel.getFuelHistory as any).mockResolvedValue(mockHistory);

      const query = { from: '2026-09-01', to: '2026-09-03' };
      const res = await fuelService.getFuelHistory(query);
      expect(apiClient.fuel.getFuelHistory).toHaveBeenCalledWith(query);
      expect(res).toEqual(mockHistory);
    });
  });
});
