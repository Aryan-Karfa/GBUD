import { describe, it, expect, vi, beforeEach } from 'vitest';
import { homeService } from '../features/home/services/home.service';
import { trainService } from '../features/train/services/train.service';
import { fuelService } from '../features/fuel/services/fuel.service';
import { progressService } from '../features/progress/services/progress.service';

vi.mock('../features/train/services/train.service', () => ({
  trainService: {
    getActiveWorkoutSession: vi.fn(),
    listWorkoutHistory: vi.fn(),
  },
}));

vi.mock('../features/fuel/services/fuel.service', () => ({
  fuelService: {
    getDailySummary: vi.fn(),
    compareFuelSummary: vi.fn(),
    listMeals: vi.fn(),
  },
}));

vi.mock('../features/progress/services/progress.service', () => ({
  progressService: {
    getProgressDashboard: vi.fn(),
  },
}));

describe('HomeService Domain Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTrainingDomain', () => {
    it('delegates to trainService for active workout and recent workout history', async () => {
      const mockActive = {
        id: 'session-active',
        userId: 'user-1',
        status: 'IN_PROGRESS' as const,
        startedAt: '2026-09-03T08:30:00Z',
        completedAt: null,
        abandonedAt: null,
        createdAt: '2026-09-03T08:30:00Z',
        updatedAt: '2026-09-03T08:30:00Z',
        workoutTemplateId: null,
        sessionExercises: [],
      };
      const mockRecent = {
        id: 'session-prev',
        userId: 'user-1',
        status: 'COMPLETED' as const,
        startedAt: '2026-09-02T08:00:00Z',
        completedAt: '2026-09-02T09:00:00Z',
        abandonedAt: null,
        createdAt: '2026-09-02T08:00:00Z',
        updatedAt: '2026-09-02T09:00:00Z',
        workoutTemplateId: null,
        sessionExercises: [],
      };

      (trainService.getActiveWorkoutSession as any).mockResolvedValue(mockActive);
      (trainService.listWorkoutHistory as any).mockResolvedValue({
        items: [mockRecent],
        pagination: { total: 1, page: 1, limit: 1, totalPages: 1 },
      });

      const res = await homeService.fetchTrainingDomain();
      expect(trainService.getActiveWorkoutSession).toHaveBeenCalled();
      expect(trainService.listWorkoutHistory).toHaveBeenCalledWith({ page: 1, limit: 1 });
      expect(res.error).toBeNull();
      expect(res.data?.activeWorkout).toEqual(mockActive);
      expect(res.data?.recentWorkout).toEqual(mockRecent);
    });

    it('handles null active workout cleanly when user is idle', async () => {
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(null);
      (trainService.listWorkoutHistory as any).mockResolvedValue({
        items: [],
        pagination: { total: 0, page: 1, limit: 1, totalPages: 0 },
      });

      const res = await homeService.fetchTrainingDomain();
      expect(res.error).toBeNull();
      expect(res.data?.activeWorkout).toBeNull();
      expect(res.data?.recentWorkout).toBeNull();
    });
  });

  describe('fetchFuelDomain', () => {
    it('delegates to fuelService for summary, target comparison, and logged meals', async () => {
      const mockSummary = {
        date: '2026-09-03',
        calories: 1850,
        protein: 140,
        carbohydrates: 200,
        fat: 55,
        fiber: 25,
        meals: 2,
      };
      const mockComparison = {
        date: '2026-09-03',
        actual: { calories: 1850, protein: 140, carbohydrates: 200, fat: 55 },
        target: { calories: 2200, protein: 160, carbohydrates: 240, fat: 65 },
        remaining: { calories: 350, protein: 20, carbohydrates: 40, fat: 10 },
      };
      const mockMeals = [
        {
          id: 'meal-1',
          userId: 'user-1',
          name: 'Breakfast',
          mealDate: '2026-09-03',
          mealType: 'BREAKFAST' as const,
          totalCalories: 650,
          totalProtein: 45,
          totalCarbohydrates: 70,
          totalFat: 20,
          totalFiber: 8,
          createdAt: '2026-09-03T08:00:00Z',
          updatedAt: '2026-09-03T08:00:00Z',
          entries: [],
        },
      ];

      (fuelService.getDailySummary as any).mockResolvedValue(mockSummary);
      (fuelService.compareFuelSummary as any).mockResolvedValue(mockComparison);
      (fuelService.listMeals as any).mockResolvedValue({
        items: mockMeals,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });

      const res = await homeService.fetchFuelDomain('2026-09-03');
      expect(fuelService.getDailySummary).toHaveBeenCalledWith('2026-09-03');
      expect(fuelService.compareFuelSummary).toHaveBeenCalledWith('2026-09-03');
      expect(fuelService.listMeals).toHaveBeenCalledWith({ mealDate: '2026-09-03' });
      expect(res.error).toBeNull();
      expect(res.data?.summary).toEqual(mockSummary);
      expect(res.data?.comparison).toEqual(mockComparison);
      expect(res.data?.todayMeals).toEqual(mockMeals);
    });
  });

  describe('fetchProgressDomain', () => {
    it('delegates to progressService.getProgressDashboard', async () => {
      const mockDashboard = {
        summary: {
          totalWorkouts: 12,
          completedWorkouts: 11,
          abandonedWorkouts: 1,
          trainingDays: 9,
          totalSets: 48,
          totalReps: 420,
          totalVolume: 42350,
          averageWorkoutDurationSeconds: 3600,
        },
        frequency: {
          totalWorkouts: 12,
          completedWorkouts: 11,
          abandonedWorkouts: 1,
          trainingDays: 9,
          workoutsPerWeek: 3.2,
        },
        totalVolume: { totalVolume: 42350, unit: 'kg' },
        topExercisesByVolume: [],
        recentWorkouts: [],
        prHighlights: [
          {
            exerciseId: 'ex-bench',
            exerciseName: 'Bench Press',
            maxWeight: 100,
            maxReps: 5,
            maxVolume: 500,
            estimated1RM: 116.67,
            achievedAt: '2026-08-25',
            sessionId: 'sess-1',
            sessionExerciseId: 'se-1',
          },
        ],
      };

      (progressService.getProgressDashboard as any).mockResolvedValue(mockDashboard);

      const res = await homeService.fetchProgressDomain();
      expect(progressService.getProgressDashboard).toHaveBeenCalled();
      expect(res.error).toBeNull();
      expect(res.data?.dashboard).toEqual(mockDashboard);
    });
  });

  describe('fetchDashboard & Partial Error Isolation', () => {
    it('coordinates concurrent execution across all domains and isolates errors', async () => {
      // Training succeeds
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(null);
      (trainService.listWorkoutHistory as any).mockResolvedValue({ items: [], pagination: {} });

      // Fuel throws an error
      (fuelService.getDailySummary as any).mockRejectedValue(new Error('Fuel API timeout'));

      // Progress succeeds
      (progressService.getProgressDashboard as any).mockResolvedValue({
        summary: { completedWorkouts: 5, totalVolume: 15000, trainingDays: 4 },
        frequency: { workoutsPerWeek: 2 },
        totalVolume: { totalVolume: 15000, unit: 'kg' },
        topExercisesByVolume: [],
        recentWorkouts: [],
        prHighlights: [],
      });

      const dashboard = await homeService.fetchDashboard('2026-09-03');

      // Training domain succeeded
      expect(dashboard.training.error).toBeNull();
      expect(dashboard.training.data).not.toBeNull();

      // Progress domain succeeded
      expect(dashboard.progress.error).toBeNull();
      expect(dashboard.progress.data?.dashboard?.summary.completedWorkouts).toBe(5);

      // Fuel domain failed gracefully without crashing the whole dashboard
      // Note: fuelService handles catch internally, but if it throws or returns null:
      expect(dashboard.fuel.data).not.toBeNull();
    });

    it('isolates progress domain failure when progress service rejects', async () => {
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(null);
      (trainService.listWorkoutHistory as any).mockResolvedValue({ items: [], pagination: {} });
      (fuelService.getDailySummary as any).mockResolvedValue({ calories: 0, meals: 0 });
      (fuelService.compareFuelSummary as any).mockResolvedValue(null);
      (fuelService.listMeals as any).mockResolvedValue({ items: [] });
      (progressService.getProgressDashboard as any).mockRejectedValue(new Error('Progress database offline'));

      const dashboard = await homeService.fetchDashboard('2026-09-03');

      expect(dashboard.training.error).toBeNull();
      expect(dashboard.fuel.error).toBeNull();
      expect(dashboard.progress.error).toBe('Progress database offline');
      expect(dashboard.progress.data).toBeNull();
    });
  });
});
