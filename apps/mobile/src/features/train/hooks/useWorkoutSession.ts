import { useState, useEffect, useCallback } from 'react';
import {
  WorkoutSessionDTO,
  AddWorkoutSetInput,
  UpdateWorkoutSetInput,
} from '../train.types';
import { trainService } from '../services/train.service';

export interface UseWorkoutSessionOptions {
  sessionId?: string;
  autoCheckActive?: boolean;
}

export function useWorkoutSession(options: UseWorkoutSessionOptions = {}) {
  const { sessionId, autoCheckActive = true } = options;

  const [session, setSession] = useState<WorkoutSessionDTO | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSessionDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for an existing active session on mount
  const checkActiveSession = useCallback(async (): Promise<WorkoutSessionDTO | null> => {
    try {
      const active = await trainService.getActiveWorkoutSession();
      setActiveSession(active);
      return active;
    } catch (err: any) {
      // If 401 or network error, don't crash
      setActiveSession(null);
      return null;
    }
  }, []);

  const fetchSession = useCallback(async (id: string): Promise<WorkoutSessionDTO | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await trainService.getWorkoutSession(id);
      setSession(data);
      if (data.status === 'IN_PROGRESS') {
        setActiveSession(data);
      } else if (activeSession?.id === id) {
        setActiveSession(null);
      }
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to load workout session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession?.id]);

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    } else if (autoCheckActive) {
      checkActiveSession();
    }
  }, [sessionId, autoCheckActive, fetchSession, checkActiveSession]);

  const startSession = useCallback(
    async (workoutTemplateId: string): Promise<WorkoutSessionDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const created = await trainService.startWorkoutSession({ workoutTemplateId });
        setSession(created);
        setActiveSession(created);
        return created;
      } catch (err: any) {
        if (err.status === 409 || err.code === 'CONFLICT') {
          // If already in progress, try to fetch the active session
          const currentActive = await checkActiveSession();
          setError('A workout session is already in progress');
          if (currentActive) {
            setSession(currentActive);
          }
        } else {
          setError(err.message || 'Failed to start workout session');
        }
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [checkActiveSession]
  );

  const addSet = useCallback(
    async (
      targetSessionId: string,
      sessionExerciseId: string,
      input: AddWorkoutSetInput
    ): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await trainService.addWorkoutSet(targetSessionId, sessionExerciseId, input);
        // Refresh authoritative session snapshot from backend
        await fetchSession(targetSessionId);
      } catch (err: any) {
        setError(err.message || 'Failed to add set');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchSession]
  );

  const updateSet = useCallback(
    async (
      targetSessionId: string,
      sessionExerciseId: string,
      setId: string,
      input: UpdateWorkoutSetInput
    ): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await trainService.updateWorkoutSet(targetSessionId, sessionExerciseId, setId, input);
        await fetchSession(targetSessionId);
      } catch (err: any) {
        setError(err.message || 'Failed to update set');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchSession]
  );

  const deleteSet = useCallback(
    async (
      targetSessionId: string,
      sessionExerciseId: string,
      setId: string
    ): Promise<void> => {
      setIsMutating(true);
      setError(null);
      try {
        await trainService.deleteWorkoutSet(targetSessionId, sessionExerciseId, setId);
        await fetchSession(targetSessionId);
      } catch (err: any) {
        setError(err.message || 'Failed to delete set');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchSession]
  );

  const completeSession = useCallback(
    async (targetSessionId: string): Promise<WorkoutSessionDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const completed = await trainService.completeWorkoutSession(targetSessionId);
        setSession(completed);
        setActiveSession(null);
        return completed;
      } catch (err: any) {
        setError(err.message || 'Failed to complete workout session');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const abandonSession = useCallback(
    async (targetSessionId: string): Promise<WorkoutSessionDTO> => {
      setIsMutating(true);
      setError(null);
      try {
        const abandoned = await trainService.abandonWorkoutSession(targetSessionId);
        setSession(abandoned);
        setActiveSession(null);
        return abandoned;
      } catch (err: any) {
        setError(err.message || 'Failed to abandon workout session');
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  return {
    session,
    activeSession,
    isLoading,
    isMutating,
    error,
    checkActiveSession,
    fetchSession,
    startSession,
    addSet,
    updateSet,
    deleteSet,
    completeSession,
    abandonSession,
  };
}
