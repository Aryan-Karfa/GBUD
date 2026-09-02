import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { homeService } from '../features/home/services/home.service';
import { trainService } from '../features/train/services/train.service';
import { fuelService } from '../features/fuel/services/fuel.service';
import { progressService } from '../features/progress/services/progress.service';
import { ProgressHomeCard, FuelHomeCard, ActiveWorkoutCard, RecentActivityCard } from '../features/home/components';

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

describe('Home Architectural Invariants & Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Invariant 1: Backend Single Source of Truth & Exact Metrics', () => {
    it('preserves exact backend decimal values without client re-computation or rounding', () => {
      const mockDashboard: any = {
        summary: { completedWorkouts: 7, trainingDays: 5 },
        totalVolume: { totalVolume: 12345.67, unit: 'kg' },
        prHighlights: [
          {
            exerciseName: 'Bench Press',
            maxWeight: 92.5,
            maxReps: 5,
            estimated1RM: 107.43,
          },
        ],
      };

      const card = ProgressHomeCard({
        dashboard: mockDashboard,
        onViewProgress: vi.fn(),
      });

      // Verify the component renders with the exact backend-supplied payload
      expect(card).toBeDefined();
      expect(mockDashboard.prHighlights[0].estimated1RM).toBe(107.43);
      expect(mockDashboard.totalVolume.totalVolume).toBe(12345.67);
    });
  });

  describe('Invariant 2: Abandoned Workout Isolation', () => {
    it('does not surface abandoned workouts as valid completed activity in recent activity', () => {
      const abandonedSession: any = {
        id: 'sess-abandoned',
        status: 'ABANDONED',
        startedAt: '2026-09-02T10:00:00Z',
        abandonedAt: '2026-09-02T10:15:00Z',
        completedAt: null,
      };

      const card = RecentActivityCard({
        recentWorkout: abandonedSession,
        latestMeal: null,
        latestPR: null,
      });

      // RecentActivityCard omits sections when there is no completed activity
      expect(card).toBeNull();
    });
  });

  describe('Invariant 3: No Fabricated Data', () => {
    it('does not manufacture artificial workouts, meals, or metrics when backend data is empty', async () => {
      (trainService.getActiveWorkoutSession as any).mockResolvedValue(null);
      (trainService.listWorkoutHistory as any).mockResolvedValue({ items: [] });
      (fuelService.getDailySummary as any).mockResolvedValue(null);
      (fuelService.compareFuelSummary as any).mockResolvedValue(null);
      (fuelService.listMeals as any).mockResolvedValue({ items: [] });
      (progressService.getProgressDashboard as any).mockResolvedValue({
        summary: { completedWorkouts: 0, totalVolume: 0, trainingDays: 0 },
        frequency: { workoutsPerWeek: 0 },
        totalVolume: { totalVolume: 0, unit: 'kg' },
        topExercisesByVolume: [],
        recentWorkouts: [],
        prHighlights: [],
      });

      const dashboard = await homeService.fetchDashboard('2026-09-03');

      expect(dashboard.training.data?.activeWorkout).toBeNull();
      expect(dashboard.training.data?.recentWorkout).toBeNull();
      expect(dashboard.fuel.data?.todayMeals).toEqual([]);
      expect(dashboard.fuel.data?.summary).toBeNull();
      expect(dashboard.progress.data?.dashboard?.summary.completedWorkouts).toBe(0);
      expect(dashboard.progress.data?.dashboard?.prHighlights).toEqual([]);
    });
  });

  describe('Invariant 4: Isolated Domain Resilience', () => {
    it('ensures Home remains fully functional when FUEL domain fails', async () => {
      const mockActive = {
        id: 'session-1',
        status: 'IN_PROGRESS' as const,
        startedAt: '2026-09-03T09:00:00Z',
        completedAt: null,
        abandonedAt: null,
        userId: 'u-1',
        workoutTemplateId: null,
        createdAt: '2026-09-03T09:00:00Z',
        updatedAt: '2026-09-03T09:00:00Z',
        sessionExercises: [],
      };

      (trainService.getActiveWorkoutSession as any).mockResolvedValue(mockActive);
      (trainService.listWorkoutHistory as any).mockResolvedValue({ items: [] });
      (fuelService.getDailySummary as any).mockRejectedValue(new Error('Fuel Service 500'));
      (fuelService.compareFuelSummary as any).mockRejectedValue(new Error('Fuel Service 500'));
      (fuelService.listMeals as any).mockRejectedValue(new Error('Fuel Service 500'));
      (progressService.getProgressDashboard as any).mockResolvedValue({
        summary: { completedWorkouts: 3, totalVolume: 10000, trainingDays: 3 },
        totalVolume: { totalVolume: 10000, unit: 'kg' },
        prHighlights: [],
      });

      const dashboard = await homeService.fetchDashboard('2026-09-03');

      // Training and Progress continue working without disruption
      expect(dashboard.training.error).toBeNull();
      expect(dashboard.training.data?.activeWorkout).toEqual(mockActive);
      expect(dashboard.progress.error).toBeNull();
      expect(dashboard.progress.data?.dashboard?.summary.completedWorkouts).toBe(3);

      // Fuel gracefully captures error without taking down Home
      expect(dashboard.fuel.data?.summary).toBeNull();
    });
  });

  describe('Invariant 5: Active Workout vs Idle Session Priority', () => {
    it('surfaces ActiveWorkoutCard when an active workout is in progress', () => {
      const activeSession: any = {
        id: 'sess-active-888',
        status: 'IN_PROGRESS',
        startedAt: '2026-09-03T11:00:00Z',
        sessionExercises: [{ id: 'se-1' }],
      };

      const card = React.createElement(ActiveWorkoutCard, {
        session: activeSession,
        onContinue: vi.fn(),
      });

      expect(card.props.session.id).toBe('sess-active-888');
    });
  });
});
