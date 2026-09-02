import { useState, useEffect, useCallback } from 'react';
import {
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  getTodayDateString,
  shiftDateString,
} from '../fuel.types';
import { fuelService } from '../services/fuel.service';

export interface UseDailyNutritionOptions {
  initialDate?: string;
  autoFetch?: boolean;
}

export function useDailyNutrition(options: UseDailyNutritionOptions = {}) {
  const { initialDate = getTodayDateString(), autoFetch = true } = options;

  const [date, setDate] = useState<string>(initialDate);
  const [summary, setSummary] = useState<NutritionDailySummaryDTO | null>(null);
  const [comparison, setComparison] = useState<NutritionTargetComparisonDTO | null>(null);
  const [history, setHistory] = useState<NutritionDailySummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyData = useCallback(
    async (targetDate = date, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [sum, comp] = await Promise.all([
          fuelService.getDailySummary(targetDate),
          fuelService.compareFuelSummary(targetDate),
        ]);
        setSummary(sum);
        setComparison(comp);
      } catch (err: any) {
        setError(err.message || 'Failed to load daily nutrition summary');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [date]
  );

  const fetchHistory = useCallback(
    async (from?: string, to?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const fromDate = from || shiftDateString(getTodayDateString(), -30);
        const toDate = to || getTodayDateString();
        const data = await fuelService.getFuelHistory({ from: fromDate, to: toDate });
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load nutrition history');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (autoFetch) {
      fetchDailyData(date);
    }
  }, [autoFetch, date, fetchDailyData]);

  const refresh = useCallback(async () => {
    await fetchDailyData(date, true);
  }, [fetchDailyData, date]);

  const compareTwoDates = useCallback(
    async (
      dateA: string,
      dateB: string
    ): Promise<{ summaryA: NutritionDailySummaryDTO; summaryB: NutritionDailySummaryDTO }> => {
      setIsLoading(true);
      setError(null);
      try {
        const [summaryA, summaryB] = await Promise.all([
          fuelService.getDailySummary(dateA),
          fuelService.getDailySummary(dateB),
        ]);
        return { summaryA, summaryB };
      } catch (err: any) {
        const msg = err.message || 'Failed to compare nutrition dates';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    date,
    setDate,
    summary,
    comparison,
    history,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchDailyData,
    fetchHistory,
    compareTwoDates,
  };
}
