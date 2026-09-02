import {
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ExerciseTrendPointDTO,
  ExercisePerformanceSummaryDTO,
  ExercisePerformanceDTO,
  ProgressDashboardDTO,
  WorkoutSessionDTO,
  ProgressDateRangeParams,
} from '@gbud/types';

import { ProgressDateRangeInput } from '@gbud/validation';

export type {
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ExerciseTrendPointDTO,
  ExercisePerformanceSummaryDTO,
  ExercisePerformanceDTO,
  ProgressDashboardDTO,
  WorkoutSessionDTO,
  ProgressDateRangeParams,
  ProgressDateRangeInput,
};

export type DateRangePreset = '7D' | '30D' | '90D' | '6M' | '1Y' | 'CUSTOM';

// Exactly 9 PROGRESS Screens
export type ProgressScreen =
  | 'ProgressHome'
  | 'ProgressSummary'
  | 'WorkoutFrequency'
  | 'TrainingVolume'
  | 'ExerciseVolume'
  | 'MuscleVolume'
  | 'PersonalRecords'
  | 'ExercisePerformance'
  | 'ExerciseTrend';

export interface ProgressRouteParams {
  ProgressHome: { from?: string; to?: string } | undefined;
  ProgressSummary: { from?: string; to?: string } | undefined;
  WorkoutFrequency: { from?: string; to?: string } | undefined;
  TrainingVolume: { from?: string; to?: string } | undefined;
  ExerciseVolume: { from?: string; to?: string } | undefined;
  MuscleVolume: { from?: string; to?: string } | undefined;
  PersonalRecords: { from?: string; to?: string } | undefined;
  ExercisePerformance: { exerciseId?: string; exerciseName?: string } | undefined;
  ExerciseTrend: { exerciseId?: string; exerciseName?: string } | undefined;
}

// Calendar date helper functions without timezone skew
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateStr: string, offsetDays: number): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
  d.setDate(d.getDate() + offsetDays);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatCalendarDate(dateStr: string): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr;
  }
  const cleanDate = dateStr.slice(0, 10);
  const todayStr = getTodayDateString();
  const yesterdayStr = shiftDateString(todayStr, -1);

  const [yearStr, monthStr, dayStr] = cleanDate.split('-');
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const formatted = d.toLocaleDateString(undefined, options);

  if (cleanDate === todayStr) {
    return `Today (${formatted})`;
  }
  if (cleanDate === yesterdayStr) {
    return `Yesterday (${formatted})`;
  }

  return formatted;
}

export function getDateRangeForPreset(preset: DateRangePreset): { from: string; to: string } {
  const today = getTodayDateString();
  switch (preset) {
    case '7D':
      return { from: shiftDateString(today, -7), to: today };
    case '30D':
      return { from: shiftDateString(today, -30), to: today };
    case '90D':
      return { from: shiftDateString(today, -90), to: today };
    case '6M':
      return { from: shiftDateString(today, -180), to: today };
    case '1Y':
      return { from: shiftDateString(today, -365), to: today };
    case 'CUSTOM':
    default:
      return { from: shiftDateString(today, -30), to: today };
  }
}

export function isValidDateRange(from?: string, to?: string): boolean {
  if (!from || !to) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return false;
  }
  return from <= to;
}
