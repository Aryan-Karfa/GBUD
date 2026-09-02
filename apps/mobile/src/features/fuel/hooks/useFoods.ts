import { useState, useEffect, useCallback, useMemo } from 'react';
import { FoodDTO, PaginationMeta, CreateFoodInput, UpdateFoodInput } from '../fuel.types';
import { fuelService } from '../services/fuel.service';

export type FoodFilterType = 'ALL' | 'SYSTEM' | 'CUSTOM';

export interface UseFoodsOptions {
  initialSearch?: string;
  initialFilter?: FoodFilterType;
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useFoods(options: UseFoodsOptions = {}) {
  const {
    initialSearch = '',
    initialFilter = 'ALL',
    initialPage = 1,
    limit = 20,
    autoFetch = true,
  } = options;

  const [rawFoods, setRawFoods] = useState<FoodDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [search, setSearch] = useState<string>(initialSearch);
  const [filter, setFilter] = useState<FoodFilterType>(initialFilter);
  const [page, setPage] = useState<number>(initialPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFoods = useCallback(
    async (targetPage = page, targetSearch = search, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await fuelService.listFoods({
          search: targetSearch.trim() || undefined,
          page: targetPage,
          limit,
        });
        setRawFoods(res.items);
        setPagination(res.pagination);
        setPage(targetPage);
      } catch (err: any) {
        setError(err.message || 'Failed to load foods');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, search, limit]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchFoods(initialPage, search);
    }
  }, [autoFetch, search]); // Re-fetch on search change

  const refresh = useCallback(async () => {
    await fetchFoods(1, search, true);
  }, [fetchFoods, search]);

  // Client filter for SYSTEM vs CUSTOM on current page
  const foods = useMemo(() => {
    if (filter === 'SYSTEM') {
      return rawFoods.filter((f) => !f.isCustom);
    }
    if (filter === 'CUSTOM') {
      return rawFoods.filter((f) => f.isCustom);
    }
    return rawFoods;
  }, [rawFoods, filter]);

  const getFoodById = useCallback(async (id: string): Promise<FoodDTO | null> => {
    try {
      return await fuelService.getFood(id);
    } catch (err: any) {
      setError(err.message || 'Failed to load food');
      return null;
    }
  }, []);

  const createFood = useCallback(async (input: CreateFoodInput): Promise<FoodDTO> => {
    setIsMutating(true);
    setError(null);
    try {
      const created = await fuelService.createCustomFood(input);
      await fetchFoods(1, search);
      return created;
    } catch (err: any) {
      const msg = err.message || 'Failed to create food';
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [fetchFoods, search]);

  const updateFood = useCallback(async (id: string, input: UpdateFoodInput): Promise<FoodDTO> => {
    setIsMutating(true);
    setError(null);
    try {
      const updated = await fuelService.updateCustomFood(id, input);
      await fetchFoods(page, search);
      return updated;
    } catch (err: any) {
      const msg = err.message || 'Failed to update food';
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [fetchFoods, page, search]);

  const deactivateFood = useCallback(async (id: string): Promise<void> => {
    setIsMutating(true);
    setError(null);
    try {
      await fuelService.deactivateCustomFood(id);
      await fetchFoods(page, search);
    } catch (err: any) {
      const msg = err.message || 'Failed to deactivate food';
      setError(msg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [fetchFoods, page, search]);

  return {
    foods,
    rawFoods,
    pagination,
    search,
    setSearch,
    filter,
    setFilter,
    page,
    setPage,
    isLoading,
    isRefreshing,
    isMutating,
    error,
    refresh,
    fetchFoods,
    getFoodById,
    createFood,
    updateFood,
    deactivateFood,
  };
}
