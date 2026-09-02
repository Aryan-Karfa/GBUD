import { useState, useEffect, useCallback } from 'react';
import { homeService } from '../services/home.service';
import { HomeDashboardState, getTodayCalendarDate } from '../home.types';

export interface UseHomeDashboardReturn {
  dashboard: HomeDashboardState;
  loading: boolean;
  refreshing: boolean;
  todayDate: string;
  isNewUser: boolean;
  refresh: () => Promise<void>;
  retryTraining: () => Promise<void>;
  retryFuel: () => Promise<void>;
  retryProgress: () => Promise<void>;
}

const INITIAL_STATE: HomeDashboardState = {
  training: { data: null, error: null },
  fuel: { data: null, error: null },
  progress: { data: null, error: null },
};

export function useHomeDashboard(): UseHomeDashboardReturn {
  const [dashboard, setDashboard] = useState<HomeDashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const todayDate = getTodayCalendarDate();

  const loadAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await homeService.fetchDashboard(todayDate);
      setDashboard(result);
    } catch {
      // Retain previous or initial state on fetch exception
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todayDate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refresh = useCallback(async () => {
    await loadAll(true);
  }, [loadAll]);

  const retryTraining = useCallback(async () => {
    const trainingResult = await homeService.fetchTrainingDomain();
    setDashboard((prev) => ({
      ...prev,
      training: trainingResult,
    }));
  }, []);

  const retryFuel = useCallback(async () => {
    const fuelResult = await homeService.fetchFuelDomain(todayDate);
    setDashboard((prev) => ({
      ...prev,
      fuel: fuelResult,
    }));
  }, [todayDate]);

  const retryProgress = useCallback(async () => {
    const progressResult = await homeService.fetchProgressDomain();
    setDashboard((prev) => ({
      ...prev,
      progress: progressResult,
    }));
  }, []);

  // Determine if user has any recorded activity without manufacturing artificial assumptions
  const trainingData = dashboard.training.data;
  const fuelData = dashboard.fuel.data;
  const progressData = dashboard.progress.data;

  const hasTrainingActivity = Boolean(
    Boolean(trainingData?.activeWorkout) ||
    Boolean(trainingData?.recentWorkout && trainingData.recentWorkout.status === 'COMPLETED')
  );

  const hasFuelActivity = Boolean(
    (fuelData?.todayMeals && fuelData.todayMeals.length > 0) ||
    (fuelData?.summary && fuelData.summary.meals > 0)
  );

  const hasProgressActivity = Boolean(
    progressData?.dashboard &&
    (progressData.dashboard.summary.completedWorkouts > 0 ||
     progressData.dashboard.prHighlights.length > 0)
  );

  // If any domain errored, do not falsely classify user as new
  const hasErrors = Boolean(
    dashboard.training.error ||
    dashboard.fuel.error ||
    dashboard.progress.error
  );

  const isNewUser = !loading && !hasErrors && !hasTrainingActivity && !hasFuelActivity && !hasProgressActivity;

  return {
    dashboard,
    loading,
    refreshing,
    todayDate,
    isNewUser,
    refresh,
    retryTraining,
    retryFuel,
    retryProgress,
  };
}
