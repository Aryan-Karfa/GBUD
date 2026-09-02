import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trainService } from '../features/train/services/train.service';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    train: {
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
  },
}));

describe('TrainService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Exercises', () => {
    it('delegates listExercises to apiClient.train.listExercises with query', async () => {
      const mockResult = {
        items: [{ id: 'ex-1', name: 'Bench Press', muscleGroup: 'CHEST' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      (apiClient.train.listExercises as any).mockResolvedValue(mockResult);

      const query = { search: 'Bench', muscleGroup: 'CHEST' };
      const res = await trainService.listExercises(query);

      expect(apiClient.train.listExercises).toHaveBeenCalledWith(query);
      expect(res).toEqual(mockResult);
    });

    it('delegates getExercise to apiClient.train.getExercise', async () => {
      const mockEx = { id: 'ex-1', name: 'Deadlift', muscleGroup: 'BACK' };
      (apiClient.train.getExercise as any).mockResolvedValue(mockEx);

      const res = await trainService.getExercise('ex-1');

      expect(apiClient.train.getExercise).toHaveBeenCalledWith('ex-1');
      expect(res).toEqual(mockEx);
    });
  });

  describe('Workout Templates', () => {
    it('delegates listWorkoutTemplates', async () => {
      const mockTemplates = [{ id: 'tpl-1', name: 'Upper A', exercises: [] }];
      (apiClient.train.listWorkoutTemplates as any).mockResolvedValue(mockTemplates);

      const res = await trainService.listWorkoutTemplates();

      expect(apiClient.train.listWorkoutTemplates).toHaveBeenCalled();
      expect(res).toEqual(mockTemplates);
    });

    it('delegates getWorkoutTemplate', async () => {
      const mockTpl = { id: 'tpl-1', name: 'Upper A', exercises: [] };
      (apiClient.train.getWorkoutTemplate as any).mockResolvedValue(mockTpl);

      const res = await trainService.getWorkoutTemplate('tpl-1');

      expect(apiClient.train.getWorkoutTemplate).toHaveBeenCalledWith('tpl-1');
      expect(res).toEqual(mockTpl);
    });

    it('delegates createWorkoutTemplate', async () => {
      const input = { name: 'Leg Day', description: 'Squats and lunges' };
      const mockCreated = { id: 'tpl-2', ...input, exercises: [] };
      (apiClient.train.createWorkoutTemplate as any).mockResolvedValue(mockCreated);

      const res = await trainService.createWorkoutTemplate(input);

      expect(apiClient.train.createWorkoutTemplate).toHaveBeenCalledWith(input);
      expect(res).toEqual(mockCreated);
    });

    it('delegates updateWorkoutTemplate', async () => {
      const input = { name: 'Leg Day Heavy' };
      const mockUpdated = { id: 'tpl-2', name: 'Leg Day Heavy', exercises: [] };
      (apiClient.train.updateWorkoutTemplate as any).mockResolvedValue(mockUpdated);

      const res = await trainService.updateWorkoutTemplate('tpl-2', input);

      expect(apiClient.train.updateWorkoutTemplate).toHaveBeenCalledWith('tpl-2', input);
      expect(res).toEqual(mockUpdated);
    });

    it('delegates deleteWorkoutTemplate', async () => {
      (apiClient.train.deleteWorkoutTemplate as any).mockResolvedValue(null);

      const res = await trainService.deleteWorkoutTemplate('tpl-2');

      expect(apiClient.train.deleteWorkoutTemplate).toHaveBeenCalledWith('tpl-2');
      expect(res).toBeNull();
    });

    it('delegates addExerciseToTemplate and removeExerciseFromTemplate', async () => {
      const addInput = { exerciseId: 'ex-1', notes: '3x5 heavy' };
      const mockTemplateEx = { id: 'te-1', workoutTemplateId: 'tpl-1', ...addInput, order: 1 };
      (apiClient.train.addExerciseToTemplate as any).mockResolvedValue(mockTemplateEx);
      (apiClient.train.removeExerciseFromTemplate as any).mockResolvedValue(null);

      const addRes = await trainService.addExerciseToTemplate('tpl-1', addInput);
      expect(apiClient.train.addExerciseToTemplate).toHaveBeenCalledWith('tpl-1', addInput);
      expect(addRes).toEqual(mockTemplateEx);

      const removeRes = await trainService.removeExerciseFromTemplate('tpl-1', 'te-1');
      expect(apiClient.train.removeExerciseFromTemplate).toHaveBeenCalledWith('tpl-1', 'te-1');
      expect(removeRes).toBeNull();
    });

    it('delegates reorderTemplateExercises', async () => {
      const reorderInput = { exerciseIds: ['ex-2', 'ex-1'] };
      const mockResult = { id: 'tpl-1', name: 'Upper A', exercises: [] };
      (apiClient.train.reorderTemplateExercises as any).mockResolvedValue(mockResult);

      const res = await trainService.reorderTemplateExercises('tpl-1', reorderInput);

      expect(apiClient.train.reorderTemplateExercises).toHaveBeenCalledWith('tpl-1', reorderInput);
      expect(res).toEqual(mockResult);
    });
  });

  describe('Workout Sessions', () => {
    it('delegates startWorkoutSession', async () => {
      const input = { workoutTemplateId: 'tpl-1' };
      const mockSession = { id: 'ws-1', status: 'IN_PROGRESS', startedAt: '2026-01-01T10:00:00Z' };
      (apiClient.train.startWorkoutSession as any).mockResolvedValue(mockSession);

      const res = await trainService.startWorkoutSession(input);

      expect(apiClient.train.startWorkoutSession).toHaveBeenCalledWith(input);
      expect(res).toEqual(mockSession);
    });

    it('delegates getActiveWorkoutSession', async () => {
      const mockSession = { id: 'ws-1', status: 'IN_PROGRESS' };
      (apiClient.train.getActiveWorkoutSession as any).mockResolvedValue(mockSession);

      const res = await trainService.getActiveWorkoutSession();

      expect(apiClient.train.getActiveWorkoutSession).toHaveBeenCalled();
      expect(res).toEqual(mockSession);
    });

    it('delegates getWorkoutSession', async () => {
      const mockSession = { id: 'ws-1', status: 'IN_PROGRESS' };
      (apiClient.train.getWorkoutSession as any).mockResolvedValue(mockSession);

      const res = await trainService.getWorkoutSession('ws-1');

      expect(apiClient.train.getWorkoutSession).toHaveBeenCalledWith('ws-1');
      expect(res).toEqual(mockSession);
    });

    it('delegates listWorkoutHistory', async () => {
      const mockHistory = {
        items: [{ id: 'ws-0', status: 'COMPLETED' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      (apiClient.train.listWorkoutHistory as any).mockResolvedValue(mockHistory);

      const res = await trainService.listWorkoutHistory({ page: 1, limit: 10 });

      expect(apiClient.train.listWorkoutHistory).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(res).toEqual(mockHistory);
    });

    it('delegates addWorkoutSet, updateWorkoutSet, deleteWorkoutSet', async () => {
      const addInput = { reps: 10, weight: 80 };
      const mockSet = { id: 'set-1', setNumber: 1, reps: 10, weight: 80 };
      (apiClient.train.addWorkoutSet as any).mockResolvedValue(mockSet);

      const added = await trainService.addWorkoutSet('ws-1', 'se-1', addInput);
      expect(apiClient.train.addWorkoutSet).toHaveBeenCalledWith('ws-1', 'se-1', addInput);
      expect(added).toEqual(mockSet);

      const updateInput = { reps: 12, weight: 85 };
      const updatedSet = { ...mockSet, ...updateInput };
      (apiClient.train.updateWorkoutSet as any).mockResolvedValue(updatedSet);

      const updated = await trainService.updateWorkoutSet('ws-1', 'se-1', 'set-1', updateInput);
      expect(apiClient.train.updateWorkoutSet).toHaveBeenCalledWith('ws-1', 'se-1', 'set-1', updateInput);
      expect(updated).toEqual(updatedSet);

      (apiClient.train.deleteWorkoutSet as any).mockResolvedValue(null);
      const deleted = await trainService.deleteWorkoutSet('ws-1', 'se-1', 'set-1');
      expect(apiClient.train.deleteWorkoutSet).toHaveBeenCalledWith('ws-1', 'se-1', 'set-1');
      expect(deleted).toBeNull();
    });

    it('delegates completeWorkoutSession and abandonWorkoutSession', async () => {
      const mockCompleted = { id: 'ws-1', status: 'COMPLETED', completedAt: '2026-01-01T11:00:00Z' };
      (apiClient.train.completeWorkoutSession as any).mockResolvedValue(mockCompleted);

      const completed = await trainService.completeWorkoutSession('ws-1');
      expect(apiClient.train.completeWorkoutSession).toHaveBeenCalledWith('ws-1');
      expect(completed).toEqual(mockCompleted);

      const mockAbandoned = { id: 'ws-2', status: 'ABANDONED', abandonedAt: '2026-01-01T11:00:00Z' };
      (apiClient.train.abandonWorkoutSession as any).mockResolvedValue(mockAbandoned);

      const abandoned = await trainService.abandonWorkoutSession('ws-2');
      expect(apiClient.train.abandonWorkoutSession).toHaveBeenCalledWith('ws-2');
      expect(abandoned).toEqual(mockAbandoned);
    });
  });
});
