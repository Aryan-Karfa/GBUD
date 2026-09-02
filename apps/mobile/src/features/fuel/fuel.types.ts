import {
  FoodDTO,
  MealFoodEntryDTO,
  MealDTO,
  NutritionDailySummaryDTO,
  NutritionTargetDTO,
  NutritionTargetComparisonDTO,
  PaginatedResponseData,
  PaginationMeta,
  FoodQueryParams,
  MealQueryParams,
  TargetQueryParams,
  DateQueryParam,
} from '@gbud/types';

import {
  CreateFoodInput,
  UpdateFoodInput,
  FoodQueryInput,
  CreateMealInput,
  UpdateMealInput,
  AddMealFoodEntryInput,
  UpdateMealFoodEntryInput,
  NutritionTargetInput,
  UpdateNutritionTargetInput,
  MealQueryInput,
  TargetQueryInput,
  ProgressDateRangeInput,
} from '@gbud/validation';

// Re-export shared contracts
export type {
  FoodDTO,
  MealFoodEntryDTO,
  MealDTO,
  NutritionDailySummaryDTO,
  NutritionTargetDTO,
  NutritionTargetComparisonDTO,
  PaginatedResponseData,
  PaginationMeta,
  FoodQueryParams,
  MealQueryParams,
  TargetQueryParams,
  DateQueryParam,
  CreateFoodInput,
  UpdateFoodInput,
  FoodQueryInput,
  CreateMealInput,
  UpdateMealInput,
  AddMealFoodEntryInput,
  UpdateMealFoodEntryInput,
  NutritionTargetInput,
  UpdateNutritionTargetInput,
  MealQueryInput,
  TargetQueryInput,
  ProgressDateRangeInput,
};

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER';

// Exactly 10 FUEL Screens
export type FuelScreen =
  | 'FuelHome'
  | 'FoodLibrary'
  | 'FoodDetail'
  | 'CustomFoodEditor'
  | 'Meals'
  | 'MealDetail'
  | 'MealEditor'
  | 'NutritionTarget'
  | 'NutritionHistory'
  | 'NutritionComparison';

export interface FuelRouteParams {
  FuelHome: { date?: string } | undefined;
  FoodLibrary: undefined;
  FoodDetail: { foodId: string };
  CustomFoodEditor: { foodId?: string } | undefined;
  Meals: { date?: string } | undefined;
  MealDetail: { mealId: string };
  MealEditor: { mealId?: string; date?: string; mealType?: MealType } | undefined;
  NutritionTarget: { date?: string } | undefined;
  NutritionHistory: undefined;
  NutritionComparison: { dateA?: string; dateB?: string } | undefined;
}

// Calendar date utilities (pure string-based without timezone skew)
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
  const todayStr = getTodayDateString();
  const yesterdayStr = shiftDateString(todayStr, -1);
  const tomorrowStr = shiftDateString(todayStr, 1);

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  const formatted = d.toLocaleDateString(undefined, options);

  if (dateStr === todayStr) {
    return `Today, ${formatted}`;
  }
  if (dateStr === yesterdayStr) {
    return `Yesterday, ${formatted}`;
  }
  if (dateStr === tomorrowStr) {
    return `Tomorrow, ${formatted}`;
  }

  return formatted;
}
