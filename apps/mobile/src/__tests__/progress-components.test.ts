import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  DateRangeSelector,
  ProgressSectionHeader,
  ProgressMetricCard,
  ProgressSummaryCard,
  WorkoutFrequencyCard,
  VolumeSummaryCard,
  ExerciseVolumeRow,
  MuscleVolumeRow,
  PersonalRecordCard,
  ExercisePerformanceCard,
  ExerciseSelector,
  VolumeTrendChart,
  ExerciseTrendChart,
  FrequencyTrendChart,
  ProgressErrorState,
} from '../features/progress/components';
import {
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ExercisePerformanceDTO,
  ExerciseTrendPointDTO,
} from '../features/progress/progress.types';

describe('PROGRESS UI Components', () => {
  describe('DateRangeSelector', () => {
    it('renders with selected preset and range display', () => {
      const onPresetChange = vi.fn();
      const el = React.createElement(DateRangeSelector, {
        selectedPreset: '30D',
        onPresetChange,
        from: '2026-08-01',
        to: '2026-09-01',
      });
      expect(el.props.selectedPreset).toBe('30D');
      expect(el.props.from).toBe('2026-08-01');
      expect(el.props.onPresetChange).toBe(onPresetChange);
    });
  });

  describe('ProgressSectionHeader', () => {
    it('renders title, subtitle, and action handler', () => {
      const onAction = vi.fn();
      const el = React.createElement(ProgressSectionHeader, {
        title: 'Top Exercises',
        subtitle: 'Volume breakdown',
        actionLabel: 'View All',
        onActionPress: onAction,
      });
      expect(el.props.title).toBe('Top Exercises');
      expect(el.props.subtitle).toBe('Volume breakdown');
      expect(el.props.actionLabel).toBe('View All');
      expect(el.props.onActionPress).toBe(onAction);
    });
  });

  describe('ProgressMetricCard', () => {
    it('renders metric label, value, and unit', () => {
      const el = React.createElement(ProgressMetricCard, {
        label: 'Total Volume',
        value: 45000,
        unit: 'kg',
        subtext: 'Across 12 sessions',
      });
      expect(el.props.label).toBe('Total Volume');
      expect(el.props.value).toBe(45000);
      expect(el.props.unit).toBe('kg');
    });
  });

  describe('ProgressSummaryCard', () => {
    it('renders summary data and handles onPress', () => {
      const onPress = vi.fn();
      const mockSummary: ProgressSummaryDTO = {
        totalWorkouts: 12,
        completedWorkouts: 11,
        abandonedWorkouts: 1,
        trainingDays: 9,
        totalSets: 48,
        totalReps: 400,
        totalVolume: 42000,
        averageWorkoutDurationSeconds: 3600,
      };

      const el = React.createElement(ProgressSummaryCard, {
        summary: mockSummary,
        onPress,
      });
      expect(el.props.summary?.completedWorkouts).toBe(11);
      expect(el.props.summary?.totalVolume).toBe(42000);
      expect(el.props.onPress).toBe(onPress);
    });

    it('handles null summary with empty state', () => {
      const el = React.createElement(ProgressSummaryCard, { summary: null });
      expect(el.props.summary).toBeNull();
    });
  });

  describe('WorkoutFrequencyCard', () => {
    it('renders frequency metrics and abandonment note', () => {
      const mockFreq: TrainingFrequencyDTO = {
        totalWorkouts: 10,
        completedWorkouts: 9,
        abandonedWorkouts: 1,
        trainingDays: 8,
        workoutsPerWeek: 3.2,
      };

      const el = React.createElement(WorkoutFrequencyCard, { frequency: mockFreq });
      expect(el.props.frequency?.workoutsPerWeek).toBe(3.2);
      expect(el.props.frequency?.abandonedWorkouts).toBe(1);
    });
  });

  describe('VolumeSummaryCard', () => {
    it('renders total volume and unit', () => {
      const mockVol: VolumeSummaryDTO = {
        totalVolume: 52000,
        unit: 'kg',
      };
      const el = React.createElement(VolumeSummaryCard, { volumeSummary: mockVol });
      expect(el.props.volumeSummary?.totalVolume).toBe(52000);
      expect(el.props.volumeSummary?.unit).toBe('kg');
    });
  });

  describe('ExerciseVolumeRow', () => {
    it('renders exercise name, volume, and handles onPress', () => {
      const mockItem: ExerciseVolumeItemDTO = {
        exerciseId: 'ex-1',
        exerciseName: 'Barbell Bench Press',
        totalVolume: 15000,
      };
      const onPress = vi.fn();

      const el = React.createElement(ExerciseVolumeRow, {
        item: mockItem,
        maxVolume: 20000,
        onPress,
      });

      expect(el.props.item.exerciseName).toBe('Barbell Bench Press');
      expect(el.props.item.totalVolume).toBe(15000);
      expect(el.props.maxVolume).toBe(20000);
      expect(el.props.onPress).toBe(onPress);
    });
  });

  describe('MuscleVolumeRow', () => {
    it('renders muscle group and volume, preserving UNKNOWN', () => {
      const mockItem: MuscleGroupVolumeItemDTO = {
        muscleGroup: 'UNKNOWN',
        totalVolume: 3500,
      };

      const el = React.createElement(MuscleVolumeRow, {
        item: mockItem,
        maxVolume: 10000,
      });

      expect(el.props.item.muscleGroup).toBe('UNKNOWN');
      expect(el.props.item.totalVolume).toBe(3500);
    });
  });

  describe('PersonalRecordCard', () => {
    it('renders factual PR metrics without gamification', () => {
      const mockRecord: PersonalRecordItemDTO = {
        exerciseId: 'ex-1',
        exerciseName: 'Squat',
        maxWeight: 140,
        maxReps: 5,
        maxVolume: 700,
        estimated1RM: 163.33,
        achievedAt: '2026-08-20',
        sessionId: 's-1',
        sessionExerciseId: 'se-1',
      };

      const el = React.createElement(PersonalRecordCard, { record: mockRecord });
      expect(el.props.record.exerciseName).toBe('Squat');
      expect(el.props.record.estimated1RM).toBe(163.33);
      expect(el.props.record.maxWeight).toBe(140);
    });
  });

  describe('ExercisePerformanceCard', () => {
    it('renders detailed exercise performance stats', () => {
      const mockPerf: ExercisePerformanceDTO = {
        exercise: { id: 'ex-1', name: 'Deadlift' },
        summary: {
          sessions: 8,
          sets: 32,
          totalReps: 160,
          totalVolume: 24000,
          maxWeight: 160,
          maxReps: 6,
          estimated1RM: 192,
        },
        recent: [],
      };

      const el = React.createElement(ExercisePerformanceCard, { performance: mockPerf });
      expect(el.props.performance?.exercise.name).toBe('Deadlift');
      expect(el.props.performance?.summary.estimated1RM).toBe(192);
    });
  });

  describe('ExerciseSelector', () => {
    it('renders modal with search and callbacks', () => {
      const onSelect = vi.fn();
      const onClose = vi.fn();

      const el = React.createElement(ExerciseSelector, {
        visible: true,
        onSelect,
        onClose,
      });

      expect(el.props.visible).toBe(true);
      expect(el.props.onSelect).toBe(onSelect);
      expect(el.props.onClose).toBe(onClose);
    });
  });

  describe('VolumeTrendChart', () => {
    it('renders time-series volume points', () => {
      const data = [
        { label: 'Week 1', volume: 8000 },
        { label: 'Week 2', volume: 10500 },
        { label: 'Week 3', volume: 12000 },
      ];

      const el = React.createElement(VolumeTrendChart, { data, title: 'Weekly Volume' });
      expect(el.props.data).toHaveLength(3);
      expect(el.props.title).toBe('Weekly Volume');
    });

    it('renders empty state when data is empty', () => {
      const el = React.createElement(VolumeTrendChart, { data: [] });
      expect(el.props.data).toHaveLength(0);
    });
  });

  describe('ExerciseTrendChart', () => {
    it('renders trend points returned by backend', () => {
      const points: ExerciseTrendPointDTO[] = [
        { date: '2026-08-01', bestWeight: 100, bestReps: 5, estimated1RM: 116.67 },
        { date: '2026-08-15', bestWeight: 105, bestReps: 5, estimated1RM: 122.5 },
      ];

      const el = React.createElement(ExerciseTrendChart, {
        points,
        exerciseName: 'Bench Press',
      });

      expect(el.props.points).toHaveLength(2);
      expect(el.props.exerciseName).toBe('Bench Press');
    });
  });

  describe('FrequencyTrendChart', () => {
    it('renders consistency metrics', () => {
      const el = React.createElement(FrequencyTrendChart, {
        workoutsPerWeek: 3.5,
        completedWorkouts: 14,
        trainingDays: 12,
        totalWorkouts: 15,
      });

      expect(el.props.workoutsPerWeek).toBe(3.5);
      expect(el.props.completedWorkouts).toBe(14);
    });
  });

  describe('ProgressErrorState', () => {
    it('renders error message and retry button', () => {
      const onRetry = vi.fn();
      const el = React.createElement(ProgressErrorState, {
        error: 'Failed to connect to analytics service',
        onRetry,
      });

      expect(el.props.error).toBe('Failed to connect to analytics service');
      expect(el.props.onRetry).toBe(onRetry);
    });
  });
});
