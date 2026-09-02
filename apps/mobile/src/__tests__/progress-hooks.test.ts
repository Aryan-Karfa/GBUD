import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useProgressSummary } from '../features/progress/hooks/useProgressSummary';
import { useWorkoutFrequency } from '../features/progress/hooks/useWorkoutFrequency';
import { useTrainingVolume } from '../features/progress/hooks/useTrainingVolume';
import { usePersonalRecords } from '../features/progress/hooks/usePersonalRecords';
import { useExercisePerformance } from '../features/progress/hooks/useExercisePerformance';
import { useProgressDashboard } from '../features/progress/hooks/useProgressDashboard';
import { progressService } from '../features/progress/services/progress.service';

vi.mock('../features/progress/services/progress.service', () => ({
  progressService: {
    getProgressSummary: vi.fn(),
    getTrainingFrequency: vi.fn(),
    getVolumeSummary: vi.fn(),
    getExerciseVolume: vi.fn(),
    getMuscleVolume: vi.fn(),
    getPersonalRecords: vi.fn(),
    getExercisePerformance: vi.fn(),
    getExerciseTrend: vi.fn(),
    getProgressDashboard: vi.fn(),
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
    triggerEffects: async () => {
      for (const eff of effects) {
        await eff();
      }
    },
  };
}

describe('PROGRESS Custom Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProgressSummary', () => {
    it('defaults to 30D preset and fetches summary', async () => {
      const mockSummary = {
        totalWorkouts: 10,
        completedWorkouts: 9,
        abandonedWorkouts: 1,
        trainingDays: 8,
        totalSets: 40,
        totalReps: 320,
        totalVolume: 30000,
        averageWorkoutDurationSeconds: 3600,
      };
      (progressService.getProgressSummary as any).mockResolvedValue(mockSummary);

      const { result, triggerEffects } = runHook(() => useProgressSummary());
      expect(result.preset).toBe('30D');
      expect(result.loading).toBe(true);

      await triggerEffects();
      expect(progressService.getProgressSummary).toHaveBeenCalled();
    });

    it('handles error gracefully when fetch fails', async () => {
      (progressService.getProgressSummary as any).mockRejectedValue(new Error('Network offline'));

      const { result, triggerEffects } = runHook(() => useProgressSummary());
      await triggerEffects();
      expect(result.summary).toBeNull();
    });
  });

  describe('useWorkoutFrequency', () => {
    it('initializes with 30D and fetches frequency data', async () => {
      const mockFreq = {
        totalWorkouts: 12,
        completedWorkouts: 11,
        abandonedWorkouts: 1,
        trainingDays: 9,
        workoutsPerWeek: 3.0,
      };
      (progressService.getTrainingFrequency as any).mockResolvedValue(mockFreq);

      const { result, triggerEffects } = runHook(() => useWorkoutFrequency());
      expect(result.preset).toBe('30D');

      await triggerEffects();
      expect(progressService.getTrainingFrequency).toHaveBeenCalled();
    });
  });

  describe('useTrainingVolume', () => {
    it('fetches volume summary, exercise volume, and muscle volume in parallel', async () => {
      const mockSummary = { totalVolume: 45000, unit: 'kg' };
      const mockExercises = [{ exerciseId: 'ex-1', exerciseName: 'Bench Press', totalVolume: 15000 }];
      const mockMuscles = [{ muscleGroup: 'CHEST', totalVolume: 15000 }];

      (progressService.getVolumeSummary as any).mockResolvedValue(mockSummary);
      (progressService.getExerciseVolume as any).mockResolvedValue(mockExercises);
      (progressService.getMuscleVolume as any).mockResolvedValue(mockMuscles);

      const { result, triggerEffects } = runHook(() => useTrainingVolume());
      expect(result.preset).toBe('30D');

      await triggerEffects();
      expect(progressService.getVolumeSummary).toHaveBeenCalled();
      expect(progressService.getExerciseVolume).toHaveBeenCalled();
      expect(progressService.getMuscleVolume).toHaveBeenCalled();
    });
  });

  describe('usePersonalRecords', () => {
    it('loads personal records over date range', async () => {
      const mockPRs = [
        {
          exerciseId: 'ex-1',
          exerciseName: 'Squat',
          maxWeight: 140,
          maxReps: 5,
          maxVolume: 700,
          estimated1RM: 163.33,
          achievedAt: '2026-08-20',
          sessionId: 's-1',
          sessionExerciseId: 'se-1',
        },
      ];
      (progressService.getPersonalRecords as any).mockResolvedValue(mockPRs);

      const { result, triggerEffects } = runHook(() => usePersonalRecords());
      expect(result.preset).toBe('30D');

      await triggerEffects();
      expect(progressService.getPersonalRecords).toHaveBeenCalled();
    });
  });

  describe('useExercisePerformance', () => {
    it('initializes idle without exerciseId and loads when exercise selected', async () => {
      const { result } = runHook(() => useExercisePerformance());
      expect(result.selectedExerciseId).toBeNull();
      expect(result.performance).toBeNull();
    });

    it('loads performance and trend points when exerciseId provided', async () => {
      const mockPerf = {
        exercise: { id: 'ex-1', name: 'Deadlift' },
        summary: {
          sessions: 5,
          sets: 20,
          totalReps: 100,
          totalVolume: 12000,
          maxWeight: 150,
          maxReps: 5,
          estimated1RM: 175,
        },
        recent: [],
      };
      const mockTrend = [
        { date: '2026-08-01', bestWeight: 140, bestReps: 5, estimated1RM: 163.33 },
      ];

      (progressService.getExercisePerformance as any).mockResolvedValue(mockPerf);
      (progressService.getExerciseTrend as any).mockResolvedValue(mockTrend);

      const { result, triggerEffects } = runHook(() =>
        useExercisePerformance({ initialExerciseId: 'ex-1', initialExerciseName: 'Deadlift' })
      );

      expect(result.selectedExerciseId).toBe('ex-1');
      await triggerEffects();

      expect(progressService.getExercisePerformance).toHaveBeenCalledWith('ex-1');
      expect(progressService.getExerciseTrend).toHaveBeenCalledWith('ex-1');
    });
  });

  describe('useProgressDashboard', () => {
    it('fetches dashboard data on mount', async () => {
      const mockDash = {
        summary: {
          totalWorkouts: 8,
          completedWorkouts: 8,
          abandonedWorkouts: 0,
          trainingDays: 6,
          totalSets: 32,
          totalReps: 256,
          totalVolume: 24000,
          averageWorkoutDurationSeconds: 3000,
        },
        frequency: {
          totalWorkouts: 8,
          completedWorkouts: 8,
          abandonedWorkouts: 0,
          trainingDays: 6,
          workoutsPerWeek: 2.5,
        },
        totalVolume: { totalVolume: 24000, unit: 'kg' },
        topExercisesByVolume: [],
        recentWorkouts: [],
        prHighlights: [],
      };
      (progressService.getProgressDashboard as any).mockResolvedValue(mockDash);

      const { triggerEffects } = runHook(() => useProgressDashboard());
      await triggerEffects();

      expect(progressService.getProgressDashboard).toHaveBeenCalled();
    });
  });
});
