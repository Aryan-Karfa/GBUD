import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trainService } from '../features/train/services/train.service';
import { apiClient } from '../api/client';
import { WorkoutSessionDTO } from '../features/train/train.types';

vi.mock('../api/client', () => ({
  apiClient: {
    train: {
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

describe('TRAIN Workout Session Lifecycle & Domain Invariants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts a workout session and initializes exercise snapshot', async () => {
    const mockSession: WorkoutSessionDTO = {
      id: 'session-101',
      userId: 'user-1',
      workoutTemplateId: 'tpl-1',
      status: 'IN_PROGRESS',
      startedAt: '2026-01-01T10:00:00Z',
      completedAt: null,
      abandonedAt: null,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
      sessionExercises: [
        {
          id: 'se-1',
          workoutSessionId: 'session-101',
          exerciseId: 'ex-1',
          name: 'Bench Press',
          order: 1,
          notes: '3x10 moderate',
          sets: [],
          createdAt: '2026-01-01T10:00:00Z',
          updatedAt: '2026-01-01T10:00:00Z',
        },
      ],
    };

    (apiClient.train.startWorkoutSession as any).mockResolvedValue(mockSession);

    const started = await trainService.startWorkoutSession({ workoutTemplateId: 'tpl-1' });

    expect(apiClient.train.startWorkoutSession).toHaveBeenCalledWith({ workoutTemplateId: 'tpl-1' });
    expect(started.status).toBe('IN_PROGRESS');
    expect(started.sessionExercises).toHaveLength(1);
    expect(started.sessionExercises[0].name).toBe('Bench Press');
  });

  it('enforces single active session rule (409 conflict when starting while another is active)', async () => {
    const conflictError: any = new Error('A workout session is already in progress');
    conflictError.status = 409;
    conflictError.code = 'CONFLICT';

    (apiClient.train.startWorkoutSession as any).mockRejectedValue(conflictError);

    await expect(
      trainService.startWorkoutSession({ workoutTemplateId: 'tpl-2' })
    ).rejects.toMatchObject({
      status: 409,
      code: 'CONFLICT',
    });
  });

  it('logs multiple sets for an exercise in sequence', async () => {
    const set1 = { id: 'set-1', workoutSessionExerciseId: 'se-1', setNumber: 1, reps: 10, weight: 80, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    const set2 = { id: 'set-2', workoutSessionExerciseId: 'se-1', setNumber: 2, reps: 8, weight: 85, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

    (apiClient.train.addWorkoutSet as any)
      .mockResolvedValueOnce(set1)
      .mockResolvedValueOnce(set2);

    const res1 = await trainService.addWorkoutSet('session-101', 'se-1', { reps: 10, weight: 80 });
    expect(res1).toEqual(set1);

    const res2 = await trainService.addWorkoutSet('session-101', 'se-1', { reps: 8, weight: 85 });
    expect(res2).toEqual(set2);

    expect(apiClient.train.addWorkoutSet).toHaveBeenCalledTimes(2);
  });

  it('updates an existing logged set', async () => {
    const updatedSet = { id: 'set-1', workoutSessionExerciseId: 'se-1', setNumber: 1, reps: 12, weight: 85, createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    (apiClient.train.updateWorkoutSet as any).mockResolvedValue(updatedSet);

    const res = await trainService.updateWorkoutSet('session-101', 'se-1', 'set-1', {
      reps: 12,
      weight: 85,
    });

    expect(apiClient.train.updateWorkoutSet).toHaveBeenCalledWith('session-101', 'se-1', 'set-1', {
      reps: 12,
      weight: 85,
    });
    expect(res).toEqual(updatedSet);
  });

  it('deletes a logged set', async () => {
    (apiClient.train.deleteWorkoutSet as any).mockResolvedValue(null);

    const res = await trainService.deleteWorkoutSet('session-101', 'se-1', 'set-1');

    expect(apiClient.train.deleteWorkoutSet).toHaveBeenCalledWith('session-101', 'se-1', 'set-1');
    expect(res).toBeNull();
  });

  it('completes an active workout session', async () => {
    const completedSession: WorkoutSessionDTO = {
      id: 'session-101',
      userId: 'user-1',
      workoutTemplateId: 'tpl-1',
      status: 'COMPLETED',
      startedAt: '2026-01-01T10:00:00Z',
      completedAt: '2026-01-01T11:05:00Z',
      abandonedAt: null,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T11:05:00Z',
      sessionExercises: [],
    };

    (apiClient.train.completeWorkoutSession as any).mockResolvedValue(completedSession);

    const res = await trainService.completeWorkoutSession('session-101');

    expect(apiClient.train.completeWorkoutSession).toHaveBeenCalledWith('session-101');
    expect(res.status).toBe('COMPLETED');
    expect(res.completedAt).toBe('2026-01-01T11:05:00Z');
  });

  it('abandons an active workout session', async () => {
    const abandonedSession: WorkoutSessionDTO = {
      id: 'session-102',
      userId: 'user-1',
      workoutTemplateId: null,
      status: 'ABANDONED',
      startedAt: '2026-01-01T10:00:00Z',
      completedAt: null,
      abandonedAt: '2026-01-01T10:20:00Z',
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:20:00Z',
      sessionExercises: [],
    };

    (apiClient.train.abandonWorkoutSession as any).mockResolvedValue(abandonedSession);

    const res = await trainService.abandonWorkoutSession('session-102');

    expect(apiClient.train.abandonWorkoutSession).toHaveBeenCalledWith('session-102');
    expect(res.status).toBe('ABANDONED');
    expect(res.abandonedAt).toBe('2026-01-01T10:20:00Z');
  });

  it('retrieves historical session and preserves immutable exercise snapshot', async () => {
    const historicalSession: WorkoutSessionDTO = {
      id: 'session-archived',
      userId: 'user-1',
      workoutTemplateId: null,
      status: 'COMPLETED',
      startedAt: '2026-01-01T10:00:00Z',
      completedAt: '2026-01-01T11:00:00Z',
      abandonedAt: null,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T11:00:00Z',
      sessionExercises: [
        {
          id: 'se-hist-1',
          workoutSessionId: 'session-archived',
          exerciseId: 'ex-deleted-later',
          name: 'Old Barbell Squat',
          order: 1,
          notes: 'Snapshot preserved',
          sets: [
            {
              id: 'set-h-1',
              workoutSessionExerciseId: 'se-hist-1',
              setNumber: 1,
              reps: 10,
              weight: 100,
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
          ],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    };

    (apiClient.train.getWorkoutSession as any).mockResolvedValue(historicalSession);

    const session = await trainService.getWorkoutSession('session-archived');

    expect(session.status).toBe('COMPLETED');
    expect(session.sessionExercises[0].name).toBe('Old Barbell Squat');
    expect(session.sessionExercises[0].sets[0].weight).toBe(100);
  });
});
