import { useState, useEffect, useCallback } from 'react';
import {
  NutritionTargetDTO,
  PaginationMeta,
  NutritionTargetInput,
  UpdateNutritionTargetInput,
} from '../fuel.types';
import { fuelService } from '../services/fuel.service';

export interface UseNutritionTargetsOptions {
  date?: string;
  autoFetch?: boolean;
}

export function useNutritionTargets(options: UseNutritionTargetsOptions = {}) {
  const { date, autoFetch = true } = options;

  const [currentTarget, setCurrentTarget] = useState<NutritionTargetDTO | null>(null);
  const [targets, setTargets] = useState<NutritionTargetDTO[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentTarget = useCallback(
    async (targetDate = date) => {
      setIsLoading(true);
      setError(null);
      try {
        const target = await fuelService.getCurrentNutritionTarget(targetDate);
        setCurrentTarget(target);
        return target;
      } catch (err: any) {
        setError(err.message || 'Failed to load nutrition target');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [date]
  );

  const fetchTargetHistory = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fuelService.listNutritionTargets({ page: targetPage, limit: 20 });
      setTargets(res.items);
      setPagination(res.pagination);
      setPage(targetPage);
    } catch (err: any) {
      setError(err.message || 'Failed to load target history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCurrentTarget(date);
      fetchTargetHistory(1);
    }
  }, [autoFetch, date, fetchCurrentTarget, fetchTargetHistory]);

  const createTarget = useCallback(
    async (input: NutritionTargetInput): Promise<NutritionTargetDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const created = await fuelService.createNutritionTarget(input);
        await fetchCurrentTarget(date);
        await fetchTargetHistory(1);
        return created;
      } catch (err: any) {
        if (err.status === 409 || err.code === 'CONFLICT') {
          setError('A nutrition target is already set for this effective date.');
        } else {
          setError(err.message || 'Failed to create nutrition target');
        }
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchCurrentTarget, fetchTargetHistory, date]
  );

  const updateTarget = useCallback(
    async (id: string, input: UpdateNutritionTargetInput): Promise<NutritionTargetDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const updated = await fuelService.updateNutritionTarget(id, input);
        await fetchCurrentTarget(date);
        await fetchTargetHistory(page);
        return updated;
      } catch (err: any) {
        setError(err.message || 'Failed to update nutrition target');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchCurrentTarget, fetchTargetHistory, date, page]
  );

  const deleteTarget = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await fuelService.deleteNutritionTarget(id);
        await fetchCurrentTarget(date);
        await fetchTargetHistory(1);
      } catch (err: any) {
        setError(err.message || 'Failed to delete nutrition target');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchCurrentTarget, fetchTargetHistory, date]
  );

  return {
    currentTarget,
    targets,
    pagination,
    page,
    setPage,
    isLoading,
    isMutating,
    error,
    fetchCurrentTarget,
    fetchTargetHistory,
    createTarget,
    updateTarget,
    deleteTarget,
  };
}
