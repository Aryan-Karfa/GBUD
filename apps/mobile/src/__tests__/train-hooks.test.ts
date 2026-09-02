import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { useExercises } from '../features/train/hooks/useExercises';
import { useWorkoutTemplates } from '../features/train/hooks/useWorkoutTemplates';
import { useWorkoutSession } from '../features/train/hooks/useWorkoutSession';
import { useWorkoutHistory } from '../features/train/hooks/useWorkoutHistory';
import { trainService } from '../features/train/services/train.service';

vi.mock('../features/train/services/train.service', () => ({
  trainService: {
    listExercises: vi.fn(),
    getExercise: vi.fn(),
    listWorkoutTemplates: vi.fn(),
    getWorkoutTemplate: vi.fn(),
    createWorkoutTemplate: vi.fn(),
    updateWorkoutTemplate: vi.fn(),
    deleteWorkoutTemplate: vi.fn(),
    addExerciseToTemplate: vi.fn(),
    removeExerciseFromTemplate: vi.fn(),
    reorderTemplateExercises: vi.fn(),
    startWorkoutSession: vi.fn(),
    getActiveWorkoutSession: vi.fn(),
    getWorkoutSession: vi.fn(),
    listWorkoutHistory: vi.fn(),
    addWorkoutSet: vi.fn(),
    updateWorkoutSet: vi.fn(),
    deleteWorkoutSet: vi.fn(),
    completeWorkoutSession: vi.fn(),
    abandonWorkoutSession: vi.fn(),
  },
}));

// Lightweight hook runner for React 18 in node-based vitest
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

  // Trigger pending effects
  for (const eff of effects) {
    eff();
  }

  return {
    result,
    getState: (idx: number) => stateValues[idx],
  };
}

describe('TRAIN Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useExercises', () => {
    it('fetches exercises on mount and updates state', async () => {
      const mockItems = [{ id: 'ex-1', name: 'Bench Press', muscleGroup: 'CHEST' }];
      (trainService.listExercises as any).mockResolvedValue({
        items: mockItems,
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });

      const { result } = runHook(() => useExercises());

      expect(trainService.listExercises).toHaveBeenCalled();
      expect(result.search).toBe('');
      expect(result.muscleGroup).toBe('');
    });

    it('fetches single exercise by id', async () => {
      const mockEx = { id: 'ex-1', name: 'Bench Press' };
      (trainService.getExercise as any).mockResolvedValue(mockEx);

      const { result } = runHook(() => useExercises({ autoFetch: false }));
      const found = await result.getExerciseById('ex-1');

      expect(trainService.getExercise).toHaveBeenCalledWith('ex-1');
      expect(found).toEqual(mockEx);
    });
  });

  describe('useWorkoutTemplates', () => {
    it('fetches templates on mount', async () => {
      const mockTemplates = [{ id: 'tpl-1', name: 'Upper Body', exercises: [] }];
      (trainService.listWorkoutTemplates as any).mockResolvedValue(mockTemplates);

      runHook(() => useWorkoutTemplates());

      expect(trainService.listWorkoutTemplates).toHaveBeenCalled();
    });

    it('creates template and adds exercises sequentially', async () => {
      const createdTpl = { id: 'tpl-1', name: 'Push', exercises: [] };
      const updatedTpl = {
        id: 'tpl-1',
        name: 'Push',
        exercises: [{ id: 'te-1', exerciseId: 'ex-1' }],
      };

      (trainService.listWorkoutTemplates as any).mockResolvedValue([]);
      (trainService.createWorkoutTemplate as any).mockResolvedValue(createdTpl);
      (trainService.addExerciseToTemplate as any).mockResolvedValue({});
      (trainService.getWorkoutTemplate as any).mockResolvedValue(updatedTpl);

      const { result } = runHook(() => useWorkoutTemplates({ autoFetch: false }));

      const res = await result.createTemplate(
        { name: 'Push' },
        [{ exerciseId: 'ex-1', notes: 'Heavy' }]
      );

      expect(trainService.createWorkoutTemplate).toHaveBeenCalledWith({ name: 'Push' });
      expect(trainService.addExerciseToTemplate).toHaveBeenCalledWith('tpl-1', {
        exerciseId: 'ex-1',
        notes: 'Heavy',
      });
      expect(res).toEqual(updatedTpl);
    });

    it('deletes template', async () => {
      (trainService.listWorkoutTemplates as any).mockResolvedValue([]);
      (trainService.deleteWorkoutTemplate as any).mockResolvedValue(null);

      const { result } = runHook(() => useWorkoutTemplates({ autoFetch: false }));
      await result.deleteTemplate('tpl-1');

      expect(trainService.deleteWorkoutTemplate).toHaveBeenCalledWith('tpl-1');
    });
  });

  describe('useWorkoutSession', () => {
    it('discovers active session on mount', async () => {
      const mockActive = { id: 'ws-1', status: 'IN_PROGRESS', startedAt: '2026-01-01T10:00:00Z' };
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(mockActive);

      runHook(() => useWorkoutSession({ autoCheckActive: true }));

      expect(trainService.getActiveWorkoutSession).toHaveBeenCalled();
    });

    it('starts session successfully', async () => {
      const mockSession = { id: 'ws-1', status: 'IN_PROGRESS', sessionExercises: [] };
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(null);
      (trainService.startWorkoutSession as any).mockResolvedValue(mockSession);

      const { result } = runHook(() => useWorkoutSession({ autoCheckActive: false }));
      const started = await result.startSession('tpl-1');

      expect(trainService.startWorkoutSession).toHaveBeenCalledWith({ workoutTemplateId: 'tpl-1' });
      expect(started).toEqual(mockSession);
    });

    it('handles 409 conflict when starting a session and recovers active session', async () => {
      const conflictError: any = new Error('Conflict');
      conflictError.status = 409;
      conflictError.code = 'CONFLICT';

      const existingActive = { id: 'ws-existing', status: 'IN_PROGRESS' };
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(existingActive);
      (trainService.startWorkoutSession as any).mockRejectedValue(conflictError);

      const { result } = runHook(() => useWorkoutSession({ autoCheckActive: false }));

      await expect(result.startSession('tpl-2')).rejects.toThrow();
      expect(trainService.getActiveWorkoutSession).toHaveBeenCalled();
    });

    it('adds a set and refreshes session snapshot', async () => {
      const updatedSession = {
        id: 'ws-1',
        sessionExercises: [{ id: 'se-1', sets: [{ id: 'set-1', setNumber: 1, reps: 10, weight: 100 }] }],
      };

      (trainService.getWorkoutSession as any).mockResolvedValue(updatedSession);
      (trainService.addWorkoutSet as any).mockResolvedValue({ id: 'set-1', setNumber: 1 });

      const { result } = runHook(() => useWorkoutSession({ autoCheckActive: false }));
      await result.addSet('ws-1', 'se-1', { reps: 10, weight: 100 });

      expect(trainService.addWorkoutSet).toHaveBeenCalledWith('ws-1', 'se-1', { reps: 10, weight: 100 });
      expect(trainService.getWorkoutSession).toHaveBeenCalledWith('ws-1');
    });

    it('completes session', async () => {
      const completedSession = { id: 'ws-1', status: 'COMPLETED', completedAt: '2026-01-01T11:00:00Z' };
      (trainService.completeWorkoutSession as any).mockResolvedValue(completedSession);

      const { result } = runHook(() => useWorkoutSession({ autoCheckActive: false }));
      const res = await result.completeSession('ws-1');

      expect(trainService.completeWorkoutSession).toHaveBeenCalledWith('ws-1');
      expect(res.status).toBe('COMPLETED');
    });

    it('abandons session', async () => {
      const abandonedSession = { id: 'ws-1', status: 'ABANDONED', abandonedAt: '2026-01-01T11:00:00Z' };
      (trainService.abandonWorkoutSession as any).mockResolvedValue(abandonedSession);

      const { result } = runHook(() => useWorkoutSession({ autoCheckActive: false }));
      const res = await result.abandonSession('ws-1');

      expect(trainService.abandonWorkoutSession).toHaveBeenCalledWith('ws-1');
      expect(res.status).toBe('ABANDONED');
    });
  });

  describe('useWorkoutHistory', () => {
    it('loads paginated history on mount', async () => {
      const mockHistory = [
        { id: 'ws-1', status: 'COMPLETED', startedAt: '2026-01-01T10:00:00Z' },
      ];
      (trainService.listWorkoutHistory as any).mockResolvedValue({
        items: mockHistory,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      runHook(() => useWorkoutHistory());

      expect(trainService.listWorkoutHistory).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('fetches historical session by id', async () => {
      const mockSession = { id: 'ws-1', status: 'COMPLETED', sessionExercises: [] };
      (trainService.getWorkoutSession as any).mockResolvedValue(mockSession);

      const { result } = runHook(() => useWorkoutHistory({ autoFetch: false }));
      const res = await result.getHistoricalSession('ws-1');

      expect(trainService.getWorkoutSession).toHaveBeenCalledWith('ws-1');
      expect(res).toEqual(mockSession);
    });
  });
});
