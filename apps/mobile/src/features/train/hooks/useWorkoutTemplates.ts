import { useState, useEffect, useCallback } from 'react';
import {
  WorkoutTemplateDTO,
  CreateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
  AddTemplateExerciseInput,
} from '../train.types';
import { trainService } from '../services/train.service';

export interface UseWorkoutTemplatesOptions {
  autoFetch?: boolean;
}

export function useWorkoutTemplates(options: UseWorkoutTemplatesOptions = {}) {
  const { autoFetch = true } = options;

  const [templates, setTemplates] = useState<WorkoutTemplateDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await trainService.listWorkoutTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workout templates');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [autoFetch, fetchTemplates]);

  const refresh = useCallback(async () => {
    await fetchTemplates(true);
  }, [fetchTemplates]);

  const getTemplateById = useCallback(
    async (id: string): Promise<WorkoutTemplateDTO | null> => {
      try {
        return await trainService.getWorkoutTemplate(id);
      } catch (err: any) {
        setError(err.message || 'Failed to load template');
        return null;
      }
    },
    []
  );

  const createTemplate = useCallback(
    async (
      input: CreateWorkoutTemplateInput,
      exercisesToAdd?: Array<{ exerciseId: string; notes?: string }>
    ): Promise<WorkoutTemplateDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const created = await trainService.createWorkoutTemplate(input);

        // If exercises are specified during creation, add them sequentially
        if (exercisesToAdd && exercisesToAdd.length > 0) {
          for (const ex of exercisesToAdd) {
            await trainService.addExerciseToTemplate(created.id, {
              exerciseId: ex.exerciseId,
              notes: ex.notes,
            });
          }
          // Fetch updated template with its exercises populated
          const updated = await trainService.getWorkoutTemplate(created.id);
          await fetchTemplates();
          return updated;
        }

        await fetchTemplates();
        return created;
      } catch (err: any) {
        setError(err.message || 'Failed to create template');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTemplates]
  );

  const updateTemplate = useCallback(
    async (id: string, input: UpdateWorkoutTemplateInput): Promise<WorkoutTemplateDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const updated = await trainService.updateWorkoutTemplate(id, input);
        await fetchTemplates();
        return updated;
      } catch (err: any) {
        setError(err.message || 'Failed to update template');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await trainService.deleteWorkoutTemplate(id);
        await fetchTemplates();
      } catch (err: any) {
        setError(err.message || 'Failed to delete template');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTemplates]
  );

  const addExercise = useCallback(
    async (templateId: string, input: AddTemplateExerciseInput): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await trainService.addExerciseToTemplate(templateId, input);
        await fetchTemplates();
      } catch (err: any) {
        setError(err.message || 'Failed to add exercise to template');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTemplates]
  );

  const removeExercise = useCallback(
    async (templateId: string, templateExerciseId: string): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await trainService.removeExerciseFromTemplate(templateId, templateExerciseId);
        await fetchTemplates();
      } catch (err: any) {
        setError(err.message || 'Failed to remove exercise from template');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTemplates]
  );

  const reorderExercises = useCallback(
    async (templateId: string, exerciseIds: string[]): Promise<WorkoutTemplateDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const res = await trainService.reorderTemplateExercises(templateId, { exerciseIds });
        await fetchTemplates();
        return res;
      } catch (err: any) {
        setError(err.message || 'Failed to reorder exercises');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchTemplates]
  );

  return {
    templates,
    isLoading,
    isRefreshing,
    isMutating,
    error,
    refresh,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    addExercise,
    removeExercise,
    reorderExercises,
  };
}
