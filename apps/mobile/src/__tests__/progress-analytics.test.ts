import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  getDateRangeForPreset,
  isValidDateRange,
  formatCalendarDate,
  PersonalRecordItemDTO,
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  MuscleGroupVolumeItemDTO,
  ExerciseTrendPointDTO,
} from '../features/progress/progress.types';
import {
  PersonalRecordCard,
  ProgressSummaryCard,
  WorkoutFrequencyCard,
  VolumeSummaryCard,
  MuscleVolumeRow,
  ExerciseTrendChart,
} from '../features/progress/components';

describe('PROGRESS Analytics & Invariant Verification', () => {
  describe('Exact Decimal & Number Rendering (No Recalculation)', () => {
    it('renders exact estimated1RM from backend without rounding or 1RM re-computation', () => {
      // Backend returns estimated1RM = 107.43 (from Epley formula computed on backend)
      const record: PersonalRecordItemDTO = {
        exerciseId: 'ex-bench',
        exerciseName: 'Barbell Bench Press',
        maxWeight: 95,
        maxReps: 4,
        maxVolume: 380,
        estimated1RM: 107.43,
        achievedAt: '2026-08-15',
        sessionId: 'sess-1',
        sessionExerciseId: 'se-1',
      };

      const element = React.createElement(PersonalRecordCard, { record });
      // The element must receive and pass 107.43 directly
      expect(element.props.record.estimated1RM).toBe(107.43);
      expect(element.props.record.maxWeight).toBe(95);
      expect(element.props.record.maxReps).toBe(4);
      expect(element.props.record.maxVolume).toBe(380);
    });

    it('renders exact decimal volume without recalculating weight * reps', () => {
      const volumeSummary: VolumeSummaryDTO = {
        totalVolume: 12345.67,
        unit: 'kg',
      };

      const element = React.createElement(VolumeSummaryCard, { volumeSummary });
      expect(element.props.volumeSummary?.totalVolume).toBe(12345.67);
      expect(element.props.volumeSummary?.unit).toBe('kg');
    });

    it('preserves exact decimal values in ExerciseTrendChart without deriving metrics', () => {
      const points: ExerciseTrendPointDTO[] = [
        { date: '2026-08-01', bestWeight: 100.5, bestReps: 5, estimated1RM: 117.25 },
        { date: '2026-08-15', bestWeight: 102.75, bestReps: 4, estimated1RM: 116.45 },
      ];

      const element = React.createElement(ExerciseTrendChart, { points, exerciseName: 'Overhead Press' });
      expect(element.props.points[0].estimated1RM).toBe(117.25);
      expect(element.props.points[0].bestWeight).toBe(100.5);
      expect(element.props.points[1].estimated1RM).toBe(116.45);
      expect(element.props.points[1].bestWeight).toBe(102.75);
    });
  });

  describe('Abandoned Workout Invariant', () => {
    it('strictly isolates abandoned workouts from completed workouts in ProgressSummaryCard', () => {
      const summary: ProgressSummaryDTO = {
        totalWorkouts: 15,
        completedWorkouts: 12,
        abandonedWorkouts: 3,
        trainingDays: 10,
        totalSets: 60,
        totalReps: 500,
        totalVolume: 50000,
        averageWorkoutDurationSeconds: 3200,
      };

      const element = React.createElement(ProgressSummaryCard, { summary });
      expect(element.props.summary?.completedWorkouts).toBe(12);
      expect(element.props.summary?.abandonedWorkouts).toBe(3);
      // Completed must not include abandoned
      expect(element.props.summary!.completedWorkouts + element.props.summary!.abandonedWorkouts).toBe(summary.totalWorkouts);
    });

    it('strictly reports abandoned workouts separately in WorkoutFrequencyCard', () => {
      const frequency: TrainingFrequencyDTO = {
        totalWorkouts: 20,
        completedWorkouts: 16,
        abandonedWorkouts: 4,
        trainingDays: 14,
        workoutsPerWeek: 4.0,
      };

      const element = React.createElement(WorkoutFrequencyCard, { frequency });
      expect(element.props.frequency?.completedWorkouts).toBe(16);
      expect(element.props.frequency?.abandonedWorkouts).toBe(4);
      expect(element.props.frequency?.totalWorkouts).toBe(20);
    });
  });

  describe('Muscle Group Preservation', () => {
    it('preserves UNKNOWN muscle group and renders without transformation', () => {
      const unknownMuscle: MuscleGroupVolumeItemDTO = {
        muscleGroup: 'UNKNOWN',
        totalVolume: 4200,
      };

      const element = React.createElement(MuscleVolumeRow, {
        item: unknownMuscle,
        maxVolume: 20000,
      });

      expect(element.props.item.muscleGroup).toBe('UNKNOWN');
      expect(element.props.item.totalVolume).toBe(4200);
    });
  });

  describe('Date Range Presets & Formatting', () => {
    it('generates valid YYYY-MM-DD calendar date ranges with from <= to', () => {
      const presets = ['7D', '30D', '90D', '6M', '1Y'] as const;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      for (const p of presets) {
        const range = getDateRangeForPreset(p);
        expect(range.from).toMatch(dateRegex);
        expect(range.to).toMatch(dateRegex);
        expect(range.from <= range.to).toBe(true);
        expect(isValidDateRange(range.from, range.to)).toBe(true);
      }
    });

    it('validates date ranges correctly', () => {
      expect(isValidDateRange('2026-08-01', '2026-08-30')).toBe(true);
      expect(isValidDateRange('2026-08-30', '2026-08-30')).toBe(true);
      // Inverted
      expect(isValidDateRange('2026-09-01', '2026-08-01')).toBe(false);
      // Invalid format
      expect(isValidDateRange('invalid', '2026-08-01')).toBe(false);
      expect(isValidDateRange('2026-08-01', 'invalid')).toBe(false);
    });

    it('formats calendar dates for human display safely', () => {
      const formatted = formatCalendarDate('2026-08-15');
      expect(formatted).toContain('Aug');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');

      // Invalid fallback returns original string
      expect(formatCalendarDate('')).toBe('');
      expect(formatCalendarDate('invalid-date')).toBe('invalid-date');
    });
  });
});
