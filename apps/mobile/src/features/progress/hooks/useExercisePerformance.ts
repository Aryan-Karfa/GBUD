import { useState, useEffect, useCallback } from 'react';
import { ExercisePerformanceDTO, ExerciseTrendPointDTO } from '../progress.types';
import { progressService } from '../services/progress.service';

export interface UseExercisePerformanceOptions {
  initialExerciseId?: string;
  initialExerciseName?: string;
}

export function useExercisePerformance(options?: UseExercisePerformanceOptions) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    options?.initialExerciseId ?? null
  );
  const [selectedExerciseName, setSelectedExerciseName] = useState<string | null>(
    options?.initialExerciseName ?? null
  );

  const [performance, setPerformance] = useState<ExercisePerformanceDTO | null>(null);
  const [trendPoints, setTrendPoints] = useState<ExerciseTrendPointDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExerciseData = useCallback(async (exerciseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [perfData, trendData] = await Promise.all([
        progressService.getExercisePerformance(exerciseId),
        progressService.getExerciseTrend(exerciseId),
      ]);
      setPerformance(perfData);
      setTrendPoints(trendData);
      if (perfData?.exercise?.name) {
        setSelectedExerciseName(perfData.exercise.name);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load exercise performance data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedExerciseId) {
      fetchExerciseData(selectedExerciseId);
    } else {
      setPerformance(null);
      setTrendPoints([]);
      setLoading(false);
      setError(null);
    }
  }, [fetchExerciseData, selectedExerciseId]);

  const selectExercise = useCallback((id: string, name?: string) => {
    setSelectedExerciseId(id);
    if (name) {
      setSelectedExerciseName(name);
    }
  }, []);

  const refresh = useCallback(() => {
    if (selectedExerciseId) {
      return fetchExerciseData(selectedExerciseId);
    }
    return Promise.resolve();
  }, [fetchExerciseData, selectedExerciseId]);

  return {
    selectedExerciseId,
    selectedExerciseName,
    performance,
    trendPoints,
    loading,
    error,
    selectExercise,
    refresh,
  };
}
