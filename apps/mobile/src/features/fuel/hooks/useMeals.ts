import { useState, useEffect, useCallback } from 'react';
import {
  MealDTO,
  PaginationMeta,
  CreateMealInput,
  UpdateMealInput,
  AddMealFoodEntryInput,
  UpdateMealFoodEntryInput,
  getTodayDateString,
} from '../fuel.types';
import { fuelService } from '../services/fuel.service';

export interface UseMealsOptions {
  initialDate?: string;
  autoFetch?: boolean;
}

export function useMeals(options: UseMealsOptions = {}) {
  const { initialDate = getTodayDateString(), autoFetch = true } = options;

  const [date, setDate] = useState<string>(initialDate);
  const [meals, setMeals] = useState<MealDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealsForDate = useCallback(
    async (targetDate = date, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await fuelService.listMeals({
          mealDate: targetDate,
          limit: 50,
        });
        setMeals(res.items);
        setPagination(res.pagination);
      } catch (err: any) {
        setError(err.message || 'Failed to load meals');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [date]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchMealsForDate(date);
    }
  }, [autoFetch, date, fetchMealsForDate]);

  const refresh = useCallback(async () => {
    await fetchMealsForDate(date, true);
  }, [fetchMealsForDate, date]);

  const getMealById = useCallback(async (id: string): Promise<MealDTO | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const meal = await fuelService.getMeal(id);
      setSelectedMeal(meal);
      return meal;
    } catch (err: any) {
      setError(err.message || 'Failed to load meal details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMeal = useCallback(
    async (input: CreateMealInput): Promise<MealDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const created = await fuelService.createMeal(input);
        // Refresh meals if created on current selected date
        if (input.mealDate === date) {
          await fetchMealsForDate(date);
        }
        return created;
      } catch (err: any) {
        const msg = err.message || 'Failed to create meal';
        setError(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchMealsForDate, date]
  );

  const updateMeal = useCallback(
    async (id: string, input: UpdateMealInput): Promise<MealDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const updated = await fuelService.updateMeal(id, input);
        setSelectedMeal(updated);
        setMeals((prev) => prev.map((m) => (m.id === id ? updated : m)));
        return updated;
      } catch (err: any) {
        const msg = err.message || 'Failed to update meal';
        setError(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const deleteMeal = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await fuelService.deleteMeal(id);
        setMeals((prev) => prev.filter((m) => m.id !== id));
        if (selectedMeal?.id === id) {
          setSelectedMeal(null);
        }
      } catch (err: any) {
        const msg = err.message || 'Failed to delete meal';
        setError(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [selectedMeal]
  );

  // Authoritative food entry mutations: update directly from returned server DTO
  const addFoodEntry = useCallback(
    async (mealId: string, input: AddMealFoodEntryInput): Promise<MealDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const updatedMeal = await fuelService.addFoodToMeal(mealId, input);
        setSelectedMeal(updatedMeal);
        setMeals((prev) => prev.map((m) => (m.id === mealId ? updatedMeal : m)));
        return updatedMeal;
      } catch (err: any) {
        const msg = err.message || 'Failed to add food to meal';
        setError(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const updateFoodEntryQuantity = useCallback(
    async (
      mealId: string,
      entryId: string,
      input: UpdateMealFoodEntryInput
    ): Promise<MealDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const updatedMeal = await fuelService.updateMealFoodEntry(mealId, entryId, input);
        setSelectedMeal(updatedMeal);
        setMeals((prev) => prev.map((m) => (m.id === mealId ? updatedMeal : m)));
        return updatedMeal;
      } catch (err: any) {
        const msg = err.message || 'Failed to update food quantity';
        setError(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const removeFoodEntry = useCallback(
    async (mealId: string, entryId: string): Promise<MealDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const updatedMeal = await fuelService.removeMealFoodEntry(mealId, entryId);
        setSelectedMeal(updatedMeal);
        setMeals((prev) => prev.map((m) => (m.id === mealId ? updatedMeal : m)));
        return updatedMeal;
      } catch (err: any) {
        const msg = err.message || 'Failed to remove food entry';
        setError(msg);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  return {
    date,
    setDate,
    meals,
    pagination,
    selectedMeal,
    setSelectedMeal,
    isLoading,
    isRefreshing,
    isMutating,
    error,
    refresh,
    fetchMealsForDate,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    addFoodEntry,
    updateFoodEntryQuantity,
    removeFoodEntry,
  };
}
