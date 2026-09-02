import { describe, it, expect, vi, beforeEach } from 'vitest';
import { progressService } from '../features/progress/services/progress.service';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    progress: {
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
    train: {
      listExercises: vi.fn(),
    },
  },
}));

describe('ProgressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates getProgressSummary to apiClient.progress.getProgressSummary', async () => {
    const mockSummary = {
      totalWorkouts: 12,
      completedWorkouts: 11,
      abandonedWorkouts: 1,
      trainingDays: 9,
      totalSets: 48,
      totalReps: 420,
      totalVolume: 42350,
      averageWorkoutDurationSeconds: 3600,
    };
    (apiClient.progress.getProgressSummary as any).mockResolvedValue(mockSummary);

    const result = await progressService.getProgressSummary({ from: '2026-08-01', to: '2026-09-01' });
    expect(apiClient.progress.getProgressSummary).toHaveBeenCalledWith({
      from: '2026-08-01',
      to: '2026-09-01',
    });
    expect(result).toEqual(mockSummary);
  });

  it('delegates getTrainingFrequency to apiClient.progress.getTrainingFrequency', async () => {
    const mockFreq = {
      totalWorkouts: 12,
      completedWorkouts: 11,
      abandonedWorkouts: 1,
      trainingDays: 9,
      workoutsPerWeek: 3.2,
    };
    (apiClient.progress.getTrainingFrequency as any).mockResolvedValue(mockFreq);

    const result = await progressService.getTrainingFrequency({ from: '2026-08-01', to: '2026-09-01' });
    expect(apiClient.progress.getTrainingFrequency).toHaveBeenCalledWith({
      from: '2026-08-01',
      to: '2026-09-01',
    });
    expect(result.workoutsPerWeek).toBe(3.2);
  });

  it('delegates getVolumeSummary to apiClient.progress.getVolumeSummary', async () => {
    const mockVol = {
      totalVolume: 42350,
      unit: 'kg',
    };
    (apiClient.progress.getVolumeSummary as any).mockResolvedValue(mockVol);

    const result = await progressService.getVolumeSummary();
    expect(apiClient.progress.getVolumeSummary).toHaveBeenCalledWith(undefined);
    expect(result.totalVolume).toBe(42350);
  });

  it('delegates getExerciseVolume to apiClient.progress.getExerciseVolume', async () => {
    const mockList = [
      { exerciseId: 'ex-1', exerciseName: 'Bench Press', totalVolume: 12000 },
      { exerciseId: 'ex-2', exerciseName: 'Squat', totalVolume: 18000 },
    ];
    (apiClient.progress.getExerciseVolume as any).mockResolvedValue(mockList);

    const result = await progressService.getExerciseVolume({ from: '2026-08-01', to: '2026-09-01' });
    expect(apiClient.progress.getExerciseVolume).toHaveBeenCalledWith({
      from: '2026-08-01',
      to: '2026-09-01',
    });
    expect(result).toHaveLength(2);
  });

  it('delegates getMuscleVolume to apiClient.progress.getMuscleVolume', async () => {
    const mockMuscles = [
      { muscleGroup: 'CHEST', totalVolume: 12000 },
      { muscleGroup: 'LEGS', totalVolume: 18000 },
      { muscleGroup: 'UNKNOWN', totalVolume: 2000 },
    ];
    (apiClient.progress.getMuscleVolume as any).mockResolvedValue(mockMuscles);

    const result = await progressService.getMuscleVolume();
    expect(apiClient.progress.getMuscleVolume).toHaveBeenCalled();
    expect(result[2].muscleGroup).toBe('UNKNOWN');
  });

  it('delegates getPersonalRecords to apiClient.progress.getPersonalRecords', async () => {
    const mockPRs = [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Bench Press',
        maxWeight: 100,
        maxReps: 5,
        maxVolume: 500,
        estimated1RM: 116.67,
        achievedAt: '2026-08-15',
        sessionId: 'sess-1',
        sessionExerciseId: 'se-1',
      },
    ];
    (apiClient.progress.getPersonalRecords as any).mockResolvedValue(mockPRs);

    const result = await progressService.getPersonalRecords({ from: '2026-08-01', to: '2026-09-01' });
    expect(apiClient.progress.getPersonalRecords).toHaveBeenCalledWith({
      from: '2026-08-01',
      to: '2026-09-01',
    });
    expect(result[0].estimated1RM).toBe(116.67);
  });

  it('delegates getExercisePerformance to apiClient.progress.getExercisePerformance', async () => {
    const mockPerf = {
      exercise: { id: 'ex-1', name: 'Deadlift' },
      summary: {
        sessions: 6,
        sets: 24,
        totalReps: 120,
        totalVolume: 14400,
        maxWeight: 140,
        maxReps: 8,
        estimated1RM: 177.33,
      },
      recent: [],
    };
    (apiClient.progress.getExercisePerformance as any).mockResolvedValue(mockPerf);

    const result = await progressService.getExercisePerformance('ex-1');
    expect(apiClient.progress.getExercisePerformance).toHaveBeenCalledWith('ex-1');
    expect(result.summary.estimated1RM).toBe(177.33);
  });

  it('delegates getExerciseTrend to apiClient.progress.getExerciseTrend', async () => {
    const mockPoints = [
      { date: '2026-08-01', bestWeight: 100, bestReps: 5, estimated1RM: 116.67 },
      { date: '2026-08-15', bestWeight: 105, bestReps: 5, estimated1RM: 122.5 },
    ];
    (apiClient.progress.getExerciseTrend as any).mockResolvedValue(mockPoints);

    const result = await progressService.getExerciseTrend('ex-1');
    expect(apiClient.progress.getExerciseTrend).toHaveBeenCalledWith('ex-1');
    expect(result).toHaveLength(2);
  });

  it('delegates getProgressDashboard to apiClient.progress.getProgressDashboard', async () => {
    const mockDashboard = {
      summary: {
        totalWorkouts: 10,
        completedWorkouts: 10,
        abandonedWorkouts: 0,
        trainingDays: 8,
        totalSets: 40,
        totalReps: 320,
        totalVolume: 35000,
        averageWorkoutDurationSeconds: 3200,
      },
      frequency: {
        totalWorkouts: 10,
        completedWorkouts: 10,
        abandonedWorkouts: 0,
        trainingDays: 8,
        workoutsPerWeek: 2.8,
      },
      totalVolume: { totalVolume: 35000, unit: 'kg' },
      topExercisesByVolume: [],
      recentWorkouts: [],
      prHighlights: [],
    };
    (apiClient.progress.getProgressDashboard as any).mockResolvedValue(mockDashboard);

    const result = await progressService.getProgressDashboard();
    expect(apiClient.progress.getProgressDashboard).toHaveBeenCalled();
    expect(result.summary.totalVolume).toBe(35000);
  });

  it('delegates listExercises to apiClient.train.listExercises', async () => {
    const mockList = {
      items: [{ id: 'ex-1', name: 'Overhead Press' }],
      pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };
    (apiClient.train.listExercises as any).mockResolvedValue(mockList);

    const result = await progressService.listExercises({ search: 'overhead' });
    expect(apiClient.train.listExercises).toHaveBeenCalledWith({ search: 'overhead' });
    expect(result.items[0].name).toBe('Overhead Press');
  });
});
