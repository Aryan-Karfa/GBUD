import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useHomeDashboard } from '../features/home/hooks/useHomeDashboard';
import { homeService } from '../features/home/services/home.service';

vi.mock('../features/home/services/home.service', () => ({
  homeService: {
    fetchDashboard: vi.fn(),
    fetchTrainingDomain: vi.fn(),
    fetchFuelDomain: vi.fn(),
    fetchProgressDomain: vi.fn(),
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

  stateIndex = 0;
  const result = hookFn();

  return {
    result,
    triggerEffects: async () => {
      for (const eff of effects) {
        await eff();
      }
    },
    getLatest: () => {
      (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current = dispatcher;
      stateIndex = 0;
      return hookFn();
    },
  };
}

describe('useHomeDashboard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes in loading state and fetches dashboard on mount', async () => {
    const mockState = {
      training: { data: { activeWorkout: null, recentWorkout: null }, error: null },
      fuel: { data: { summary: null, comparison: null, todayMeals: [] }, error: null },
      progress: { data: { dashboard: null }, error: null },
    };
    (homeService.fetchDashboard as any).mockResolvedValue(mockState);

    const { result, triggerEffects } = runHook(() => useHomeDashboard());
    expect(result.loading).toBe(true);
    expect(result.todayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await triggerEffects();
    expect(homeService.fetchDashboard).toHaveBeenCalledWith(result.todayDate);
  });

  describe('isNewUser Authoritative Evaluation', () => {
    it('evaluates isNewUser as true when all domains have zero recorded activity and no errors', async () => {
      const emptyState = {
        training: { data: { activeWorkout: null, recentWorkout: null }, error: null },
        fuel: { data: { summary: { meals: 0, calories: 0 }, comparison: null, todayMeals: [] }, error: null },
        progress: {
          data: {
            dashboard: {
              summary: { completedWorkouts: 0, totalVolume: 0 },
              frequency: { workoutsPerWeek: 0 },
              totalVolume: { totalVolume: 0, unit: 'kg' },
              topExercisesByVolume: [],
              recentWorkouts: [],
              prHighlights: [],
            },
          },
          error: null,
        },
      };

      (homeService.fetchDashboard as any).mockResolvedValue(emptyState);

      const { result, getLatest } = runHook(() => useHomeDashboard());
      await result.refresh();

      const latest = getLatest();
      expect(latest.isNewUser).toBe(true);
      expect(latest.loading).toBe(false);
    });

    it('evaluates isNewUser as false when an active workout is in progress', async () => {
      const activeState = {
        training: {
          data: {
            activeWorkout: { id: 'active-1', status: 'IN_PROGRESS' },
            recentWorkout: null,
          },
          error: null,
        },
        fuel: { data: { summary: null, comparison: null, todayMeals: [] }, error: null },
        progress: { data: { dashboard: null }, error: null },
      };

      (homeService.fetchDashboard as any).mockResolvedValue(activeState);

      const { result, getLatest } = runHook(() => useHomeDashboard());
      await result.refresh();

      const latest = getLatest();
      expect(latest.isNewUser).toBe(false);
    });

    it('evaluates isNewUser as false when meals exist today', async () => {
      const mealState = {
        training: { data: { activeWorkout: null, recentWorkout: null }, error: null },
        fuel: {
          data: {
            summary: { meals: 1, calories: 500 },
            comparison: null,
            todayMeals: [{ id: 'm-1', name: 'Breakfast' }],
          },
          error: null,
        },
        progress: { data: { dashboard: null }, error: null },
      };

      (homeService.fetchDashboard as any).mockResolvedValue(mealState);

      const { result, getLatest } = runHook(() => useHomeDashboard());
      await result.refresh();

      const latest = getLatest();
      expect(latest.isNewUser).toBe(false);
    });

    it('evaluates isNewUser as false if any domain has an error to prevent false classification', async () => {
      const errorState = {
        training: { data: null, error: 'Database network error' },
        fuel: { data: { summary: null, comparison: null, todayMeals: [] }, error: null },
        progress: { data: { dashboard: null }, error: null },
      };

      (homeService.fetchDashboard as any).mockResolvedValue(errorState);

      const { result, getLatest } = runHook(() => useHomeDashboard());
      await result.refresh();

      const latest = getLatest();
      expect(latest.isNewUser).toBe(false);
    });
  });

  describe('Isolated Domain Retries', () => {
    it('retryTraining re-fetches only training domain', async () => {
      const mockTrainingResult = {
        data: { activeWorkout: null, recentWorkout: null },
        error: null,
      };
      (homeService.fetchTrainingDomain as any).mockResolvedValue(mockTrainingResult);

      const { result } = runHook(() => useHomeDashboard());
      await result.retryTraining();

      expect(homeService.fetchTrainingDomain).toHaveBeenCalled();
    });

    it('retryFuel re-fetches only fuel domain for today date', async () => {
      const mockFuelResult = {
        data: { summary: null, comparison: null, todayMeals: [] },
        error: null,
      };
      (homeService.fetchFuelDomain as any).mockResolvedValue(mockFuelResult);

      const { result } = runHook(() => useHomeDashboard());
      await result.retryFuel();

      expect(homeService.fetchFuelDomain).toHaveBeenCalledWith(result.todayDate);
    });

    it('retryProgress re-fetches only progress domain', async () => {
      const mockProgressResult = {
        data: { dashboard: null },
        error: null,
      };
      (homeService.fetchProgressDomain as any).mockResolvedValue(mockProgressResult);

      const { result } = runHook(() => useHomeDashboard());
      await result.retryProgress();

      expect(homeService.fetchProgressDomain).toHaveBeenCalled();
    });
  });
});
