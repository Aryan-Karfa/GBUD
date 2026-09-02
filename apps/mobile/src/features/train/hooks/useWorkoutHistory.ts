import { useState, useEffect, useCallback } from 'react';
import { WorkoutSessionDTO, PaginationMeta } from '../train.types';
import { trainService } from '../services/train.service';

export interface UseWorkoutHistoryOptions {
  initialPage?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useWorkoutHistory(options: UseWorkoutHistoryOptions = {}) {
  const { initialPage = 1, limit = 20, autoFetch = true } = options;

  const [history, setHistory] = useState<WorkoutSessionDTO[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (targetPage = page, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const res = await trainService.listWorkoutHistory({
          page: targetPage,
          limit,
        });
        setHistory(res.items);
        setMeta(res.pagination);
        setPage(targetPage);
      } catch (err: any) {
        setError(err.message || 'Failed to load workout history');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchHistory(initialPage);
    }
  }, [autoFetch, initialPage, fetchHistory]);

  const refresh = useCallback(async () => {
    await fetchHistory(1, true);
  }, [fetchHistory]);

  const getHistoricalSession = useCallback(
    async (id: string): Promise<WorkoutSessionDTO | null> => {
      try {
        return await trainService.getWorkoutSession(id);
      } catch (err: any) {
        setError(err.message || 'Failed to load historical session');
        return null;
      }
    },
    []
  );

  return {
    history,
    meta,
    page,
    setPage,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchHistory,
    getHistoricalSession,
  };
}
