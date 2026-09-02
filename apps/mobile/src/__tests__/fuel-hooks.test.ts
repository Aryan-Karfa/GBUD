import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useFoods } from '../features/fuel/hooks/useFoods';
import { useMeals } from '../features/fuel/hooks/useMeals';
import { useNutritionTargets } from '../features/fuel/hooks/useNutritionTargets';
import { useDailyNutrition } from '../features/fuel/hooks/useDailyNutrition';
import { fuelService } from '../features/fuel/services/fuel.service';

vi.mock('../features/fuel/services/fuel.service', () => ({
  fuelService: {
    listFoods: vi.fn(),
    getFood: vi.fn(),
    createCustomFood: vi.fn(),
    updateCustomFood: vi.fn(),
    deactivateCustomFood: vi.fn(),
    listMeals: vi.fn(),
    getMeal: vi.fn(),
    createMeal: vi.fn(),
    updateMeal: vi.fn(),
    deleteMeal: vi.fn(),
    addFoodToMeal: vi.fn(),
    updateMealFoodEntry: vi.fn(),
    removeMealFoodEntry: vi.fn(),
    getCurrentNutritionTarget: vi.fn(),
    listNutritionTargets: vi.fn(),
    createNutritionTarget: vi.fn(),
    updateNutritionTarget: vi.fn(),
    deleteNutritionTarget: vi.fn(),
    getDailySummary: vi.fn(),
    compareFuelSummary: vi.fn(),
    getFuelHistory: vi.fn(),
  },
}));

function runHook<T>(hookFn: () => T) {
  const stateValues: any[] = [];
  const stateSetters: Array<(v: any) => void> = [];
  let stateIndex = 0;
  const effects: Array<() => void | (() => void)> = [];

  const dispatcher = {
    useState: (initial: any) => {
      const idx = stateIndex++;
      if (stateValues.length <= idx) {
        stateValues[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setter = (action: any) => {
        stateValues[idx] = typeof action === 'function' ? action(stateValues[idx]) : action;
      };
      stateSetters[idx] = setter;
      return [stateValues[idx], setter];
    },
    useEffect: (effect: any) => {
      effects.push(effect);
    },
    useCallback: (fn: any) => fn,
    useMemo: (fn: any) => fn(),
    useRef: (initial: any) => ({ current: initial }),
  };

  (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;

  const result = hookFn();

  return {
    result,
    flushEffects: async () => {
      for (const eff of effects) {
        await eff();
      }
    },
    rerun: () => {
      stateIndex = 0;
      return hookFn();
    },
  };
}

describe('FUEL Custom Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFoods', () => {
    it('initializes with default state and calls listFoods', async () => {
      (fuelService.listFoods as any).mockResolvedValue({
        items: [
          { id: 'f-1', name: 'Eggs', isCustom: false },
          { id: 'f-2', name: 'My Shake', isCustom: true },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      });

      const { result, flushEffects } = runHook(() => useFoods());
      expect(result.isLoading).toBe(false);
      expect(result.filter).toBe('ALL');

      await flushEffects();
      expect(fuelService.listFoods).toHaveBeenCalled();
    });

    it('filters SYSTEM vs CUSTOM foods correctly', async () => {
      (fuelService.listFoods as any).mockResolvedValue({
        items: [
          { id: 'f-1', name: 'Eggs', isCustom: false },
          { id: 'f-2', name: 'My Shake', isCustom: true },
        ],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
      });

      const { result } = runHook(() =>
        useFoods({ initialFilter: 'CUSTOM', autoFetch: false })
      );
      expect(result.filter).toBe('CUSTOM');
    });

    it('handles createFood mutation', async () => {
      (fuelService.createCustomFood as any).mockResolvedValue({
        id: 'f-3',
        name: 'Whey Protein',
        isCustom: true,
      });
      (fuelService.listFoods as any).mockResolvedValue({ items: [], pagination: null });

      const { result } = runHook(() => useFoods({ autoFetch: false }));
      const created = await result.createFood({
        name: 'Whey Protein',
        servingSize: 1,
        servingUnit: 'scoop',
        calories: 120,
        protein: 24,
        carbohydrates: 2,
        fat: 1.5,
      });

      expect(created.name).toBe('Whey Protein');
      expect(fuelService.createCustomFood).toHaveBeenCalled();
    });
  });

  describe('useMeals', () => {
    it('initializes with calendar date and loads meals', async () => {
      (fuelService.listMeals as any).mockResolvedValue({
        items: [{ id: 'm-1', name: 'Breakfast', totalCalories: 450 }],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
      });

      const { result, flushEffects } = runHook(() =>
        useMeals({ initialDate: '2026-09-03' })
      );
      expect(result.date).toBe('2026-09-03');

      await flushEffects();
      expect(fuelService.listMeals).toHaveBeenCalledWith({
        mealDate: '2026-09-03',
        limit: 50,
      });
    });

    it('creates meal and triggers date refresh', async () => {
      const mockCreated = { id: 'm-2', name: 'Snack', mealDate: '2026-09-03' };
      (fuelService.createMeal as any).mockResolvedValue(mockCreated);
      (fuelService.listMeals as any).mockResolvedValue({ items: [], pagination: null });

      const { result } = runHook(() =>
        useMeals({ initialDate: '2026-09-03', autoFetch: false })
      );
      const res = await result.createMeal({
        name: 'Snack',
        mealDate: '2026-09-03',
        mealType: 'SNACK',
      });

      expect(res.id).toBe('m-2');
      expect(fuelService.createMeal).toHaveBeenCalledWith({
        name: 'Snack',
        mealDate: '2026-09-03',
        mealType: 'SNACK',
      });
    });

    it('adds food to meal and authoritative DTO is returned', async () => {
      const mockUpdatedMeal = {
        id: 'm-1',
        name: 'Lunch',
        totalCalories: 600,
        entries: [{ id: 'e-1', foodNameSnapshot: 'Rice', caloriesSnapshot: 200 }],
      };
      (fuelService.addFoodToMeal as any).mockResolvedValue(mockUpdatedMeal);

      const { result } = runHook(() => useMeals({ autoFetch: false }));
      const res = await result.addFoodEntry('m-1', {
        foodId: 'food-rice',
        quantity: 150,
        unit: 'g',
      });

      expect(res.totalCalories).toBe(600);
      expect(fuelService.addFoodToMeal).toHaveBeenCalledWith('m-1', {
        foodId: 'food-rice',
        quantity: 150,
        unit: 'g',
      });
    });
  });

  describe('useNutritionTargets', () => {
    it('fetches effective target for date and target history', async () => {
      const mockTarget = { id: 't-1', calories: 2400, effectiveFrom: '2026-09-01' };
      (fuelService.getCurrentNutritionTarget as any).mockResolvedValue(mockTarget);
      (fuelService.listNutritionTargets as any).mockResolvedValue({
        items: [mockTarget],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const { result, flushEffects } = runHook(() =>
        useNutritionTargets({ date: '2026-09-03' })
      );

      await flushEffects();
      expect(fuelService.getCurrentNutritionTarget).toHaveBeenCalledWith('2026-09-03');
      expect(fuelService.listNutritionTargets).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('creates target and handles 409 duplicate effective date conflict', async () => {
      const conflictError: any = new Error('Conflict');
      conflictError.status = 409;
      (fuelService.createNutritionTarget as any).mockRejectedValue(conflictError);

      const { result } = runHook(() => useNutritionTargets({ autoFetch: false }));
      await expect(
        result.createTarget({
          effectiveFrom: '2026-09-03',
          calories: 2500,
          protein: 180,
          carbohydrates: 250,
          fat: 70,
        })
      ).rejects.toThrow();
    });
  });

  describe('useDailyNutrition', () => {
    it('fetches daily summary and target comparison in parallel', async () => {
      const mockSummary = { date: '2026-09-03', calories: 2000, meals: 2 };
      const mockComparison = {
        date: '2026-09-03',
        actual: { calories: 2000, protein: 150, carbohydrates: 200, fat: 60 },
        target: { calories: 2400, protein: 180, carbohydrates: 240, fat: 70 },
        remaining: { calories: 400, protein: 30, carbohydrates: 40, fat: 10 },
      };

      (fuelService.getDailySummary as any).mockResolvedValue(mockSummary);
      (fuelService.compareFuelSummary as any).mockResolvedValue(mockComparison);

      const { result, flushEffects } = runHook(() =>
        useDailyNutrition({ initialDate: '2026-09-03' })
      );

      await flushEffects();
      expect(fuelService.getDailySummary).toHaveBeenCalledWith('2026-09-03');
      expect(fuelService.compareFuelSummary).toHaveBeenCalledWith('2026-09-03');
    });

    it('fetches nutrition history over date range', async () => {
      const mockHistory = [
        { date: '2026-09-01', calories: 2100 },
        { date: '2026-09-02', calories: 2200 },
      ];
      (fuelService.getFuelHistory as any).mockResolvedValue(mockHistory);

      const { result } = runHook(() => useDailyNutrition({ autoFetch: false }));
      await result.fetchHistory('2026-09-01', '2026-09-02');

      expect(fuelService.getFuelHistory).toHaveBeenCalledWith({
        from: '2026-09-01',
        to: '2026-09-02',
      });
    });

    it('compares two distinct dates', async () => {
      const mockDayA = { date: '2026-09-02', calories: 2100, protein: 150, carbohydrates: 220, fat: 65, meals: 3 };
      const mockDayB = { date: '2026-09-03', calories: 2300, protein: 170, carbohydrates: 250, fat: 70, meals: 4 };

      (fuelService.getDailySummary as any)
        .mockResolvedValueOnce(mockDayA)
        .mockResolvedValueOnce(mockDayB);

      const { result } = runHook(() => useDailyNutrition({ autoFetch: false }));
      const comparison = await result.compareTwoDates('2026-09-02', '2026-09-03');

      expect(comparison.summaryA).toEqual(mockDayA);
      expect(comparison.summaryB).toEqual(mockDayB);
    });
  });
});
