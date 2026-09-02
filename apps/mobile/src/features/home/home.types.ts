import {
  WorkoutSessionDTO,
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  MealDTO,
  ProgressDashboardDTO,
  PersonalRecordItemDTO,
} from '@gbud/types';

// Re-export domain contracts used by Home
export type {
  WorkoutSessionDTO,
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  MealDTO,
  ProgressDashboardDTO,
  PersonalRecordItemDTO,
};

export interface DomainResult<T> {
  data: T | null;
  error: string | null;
}

export interface TrainingHomeData {
  activeWorkout: WorkoutSessionDTO | null;
  recentWorkout: WorkoutSessionDTO | null;
}

export interface FuelHomeData {
  summary: NutritionDailySummaryDTO | null;
  comparison: NutritionTargetComparisonDTO | null;
  todayMeals: MealDTO[];
}

export interface ProgressHomeData {
  dashboard: ProgressDashboardDTO | null;
}

export interface HomeDashboardState {
  training: DomainResult<TrainingHomeData>;
  fuel: DomainResult<FuelHomeData>;
  progress: DomainResult<ProgressHomeData>;
}

// Pure calendar date helper preserving YYYY-MM-DD
export function getTodayCalendarDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Human-friendly calendar greeting format (e.g. "Thursday, September 3")
export function formatCalendarGreeting(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return d.toLocaleDateString('en-US', options);
}
