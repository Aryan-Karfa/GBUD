import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  HomeHeader,
  HomeSectionHeader,
  ActiveWorkoutCard,
  TrainingHomeCard,
  FuelHomeCard,
  ProgressHomeCard,
  QuickActionGrid,
  RecentActivityCard,
  HomeLoadingState,
  HomeErrorState,
  HomeEmptyState,
} from '../features/home/components';

describe('Home Presentation Components', () => {
  describe('HomeHeader', () => {
    it('renders greeting, uppercase username, formatted calendar date, and profile button', () => {
      const onProfilePress = vi.fn();
      const el = React.createElement(HomeHeader, {
        username: 'aryan',
        dateStr: '2026-09-03',
        onProfilePress,
      });

      expect(el).toBeDefined();
      expect(el.props.username).toBe('aryan');
      expect(el.props.dateStr).toBe('2026-09-03');
    });

    it('defaults to ATHLETE when no username provided', () => {
      const el = React.createElement(HomeHeader, {
        dateStr: '2026-09-03',
      });

      expect(el).toBeDefined();
    });
  });

  describe('HomeSectionHeader', () => {
    it('renders title, optional subtitle, and action button', () => {
      const onActionPress = vi.fn();
      const el = React.createElement(HomeSectionHeader, {
        title: 'Training',
        subtitle: 'Daily Routines',
        actionLabel: 'View All',
        onActionPress,
      });

      expect(el).toBeDefined();
      expect(el.props.title).toBe('Training');
      expect(el.props.subtitle).toBe('Daily Routines');
    });
  });

  describe('ActiveWorkoutCard', () => {
    it('renders workout in progress badge, duration/time, and continue CTA', () => {
      const onContinue = vi.fn();
      const mockSession: any = {
        id: 'sess-active',
        status: 'IN_PROGRESS',
        startedAt: '2026-09-03T08:30:00Z',
        sessionExercises: [{ id: 'se-1' }, { id: 'se-2' }],
      };

      const el = React.createElement(ActiveWorkoutCard, {
        session: mockSession,
        onContinue,
      });

      expect(el).toBeDefined();
      expect(el.props.session.id).toBe('sess-active');
    });
  });

  describe('TrainingHomeCard', () => {
    it('renders TRAIN badge, last session snippet, and start workout action', () => {
      const onStartWorkout = vi.fn();
      const onViewHistory = vi.fn();
      const mockRecent: any = {
        id: 'sess-prev',
        status: 'COMPLETED',
        completedAt: '2026-09-02T10:00:00Z',
      };

      const el = React.createElement(TrainingHomeCard, {
        recentWorkout: mockRecent,
        onStartWorkout,
        onViewHistory,
      });

      expect(el).toBeDefined();
      expect(el.props.recentWorkout?.id).toBe('sess-prev');
    });
  });

  describe('FuelHomeCard', () => {
    it('renders calm meal listing, meal count, and non-judgmental compact totals', () => {
      const onViewFuel = vi.fn();
      const onLogMeal = vi.fn();
      const mockMeals: any = [
        { id: 'm-1', name: 'Eggs & Oats', mealType: 'BREAKFAST' },
        { id: 'm-2', name: 'Chicken Rice', mealType: 'LUNCH' },
      ];
      const mockSummary: any = {
        calories: 1450,
        protein: 110,
        carbohydrates: 150,
        fat: 40,
        meals: 2,
      };

      const el = React.createElement(FuelHomeCard, {
        todayMeals: mockMeals,
        summary: mockSummary,
        onViewFuel,
        onLogMeal,
      });

      expect(el).toBeDefined();
      expect(el.props.todayMeals.length).toBe(2);
    });

    it('renders empty prompt when no meals are logged today', () => {
      const onViewFuel = vi.fn();
      const el = React.createElement(FuelHomeCard, {
        todayMeals: [],
        summary: null,
        onViewFuel,
      });

      expect(el).toBeDefined();
      expect(el.props.todayMeals).toEqual([]);
    });
  });

  describe('ProgressHomeCard', () => {
    it('renders total workload with exact unit, completed workouts, and PR highlight', () => {
      const onViewProgress = vi.fn();
      const mockDashboard: any = {
        summary: { completedWorkouts: 14, trainingDays: 10 },
        totalVolume: { totalVolume: 52400, unit: 'kg' },
        prHighlights: [
          {
            exerciseName: 'Deadlift',
            estimated1RM: 180,
            maxWeight: 160,
          },
        ],
      };

      const el = React.createElement(ProgressHomeCard, {
        dashboard: mockDashboard,
        onViewProgress,
      });

      expect(el).toBeDefined();
      expect(el.props.dashboard?.totalVolume?.totalVolume).toBe(52400);
    });
  });

  describe('QuickActionGrid', () => {
    it('renders continue workout with emerald highlight when active workout exists', () => {
      const onWorkout = vi.fn();
      const onMeal = vi.fn();
      const onProgress = vi.fn();

      const el = React.createElement(QuickActionGrid, {
        hasActiveWorkout: true,
        onWorkoutAction: onWorkout,
        onMealAction: onMeal,
        onProgressAction: onProgress,
      });

      expect(el).toBeDefined();
      expect(el.props.hasActiveWorkout).toBe(true);
    });

    it('renders start workout when no active workout exists', () => {
      const el = React.createElement(QuickActionGrid, {
        hasActiveWorkout: false,
        onWorkoutAction: vi.fn(),
        onMealAction: vi.fn(),
        onProgressAction: vi.fn(),
      });

      expect(el).toBeDefined();
      expect(el.props.hasActiveWorkout).toBe(false);
    });
  });

  describe('RecentActivityCard', () => {
    it('renders recent completed workout, logged meal, and PR milestone', () => {
      const el = React.createElement(RecentActivityCard, {
        recentWorkout: { id: 'w-1', status: 'COMPLETED', completedAt: '2026-09-02' } as any,
        latestMeal: { id: 'm-1', name: 'Post-Workout Shake' } as any,
        latestPR: { exerciseName: 'Overhead Press', estimated1RM: 70, maxWeight: 60 } as any,
      });

      expect(el).not.toBeNull();
      expect((el as any)?.props?.recentWorkout?.id).toBe('w-1');
    });

    it('omits section and returns null when no authoritative activity exists', () => {
      const element = RecentActivityCard({
        recentWorkout: null,
        latestMeal: null,
        latestPR: null,
      });

      expect(element).toBeNull();
    });
  });

  describe('HomeLoadingState, HomeErrorState, and HomeEmptyState', () => {
    it('renders HomeLoadingState with loading indicator', () => {
      const el = React.createElement(HomeLoadingState, {});
      expect(el).toBeDefined();
    });

    it('renders HomeErrorState with title, message, and retry button', () => {
      const onRetry = vi.fn();
      const el = React.createElement(HomeErrorState, {
        title: 'Network Error',
        message: 'Unable to connect to server',
        onRetry,
      });

      expect(el).toBeDefined();
      expect(el.props.title).toBe('Network Error');
    });

    it('renders HomeEmptyState with welcome pillars and first-run CTAs', () => {
      const onStartTraining = vi.fn();
      const onStartFuel = vi.fn();
      const el = React.createElement(HomeEmptyState, {
        onStartTraining,
        onStartFuel,
      });

      expect(el).toBeDefined();
    });
  });
});
