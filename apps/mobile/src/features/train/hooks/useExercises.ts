import { useState, useEffect, useCallback } from 'react';
import { ExerciseDTO } from '../train.types';
import { trainService } from '../services/train.service';

export interface UseExercisesOptions {
  autoFetch?: boolean;
  initialSearch?: string;
  initialMuscleGroup?: string;
}

export function useExercises(options: UseExercisesOptions = {}) {
  const { autoFetch = true, initialSearch = '', initialMuscleGroup = '' } = options;

  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>(initialSearch);
  const [muscleGroup, setMuscleGroup] = useState<string>(initialMuscleGroup);

  const fetchExercises = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const query: { search?: string; muscleGroup?: string; limit?: number } = { limit: 100 };
        if (search.trim()) {
          query.search = search.trim();
        }
        if (muscleGroup.trim() && muscleGroup !== 'ALL') {
          query.muscleGroup = muscleGroup.trim();
        }

        const res = await trainService.listExercises(query);
        setExercises(res.items);
      } catch (err: any) {
        setError(err.message || 'Failed to load exercises');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [search, muscleGroup]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchExercises();
    }
  }, [autoFetch, fetchExercises]);

  const refresh = useCallback(async () => {
    await fetchExercises(true);
  }, [fetchExercises]);

  const getExerciseById = useCallback(async (id: string): Promise<ExerciseDTO | null> => {
    try {
      return await trainService.getExercise(id);
    } catch {
      return null;
    }
  }, []);

  return {
    exercises,
    isLoading,
    isRefreshing,
    error,
    search,
    setSearch,
    muscleGroup,
    setMuscleGroup,
    refresh,
    getExerciseById,
  };
}
