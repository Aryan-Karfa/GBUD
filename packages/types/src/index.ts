export interface APIErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface APIErrorBody {
  code: string;
  details?: APIErrorDetail[] | Record<string, unknown> | null;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: APIErrorBody | null;
  timestamp: string;
}

export interface APIErrorResponse {
  success: false;
  message: string;
  error: APIErrorBody;
  timestamp: string;
}

export interface HealthCheckStatus {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  timestamp: string;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
<<<<<<< HEAD
=======

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: UserDTO;
  tokens: AuthTokens;
}

export interface JWTPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface ExerciseDTO {
  id: string;
  name: string;
  description: string | null;
  muscleGroup: string | null;
  equipment: string | null;
  movementPattern: string | null;
  exerciseType: string | null;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplateExerciseDTO {
  id: string;
  workoutTemplateId: string;
  exerciseId: string;
  order: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  exercise: ExerciseDTO;
}

export interface WorkoutTemplateDTO {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: WorkoutTemplateExerciseDTO[];
}

export interface WorkoutSetDTO {
  id: string;
  workoutSessionExerciseId: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSessionExerciseDTO {
  id: string;
  workoutSessionId: string;
  exerciseId: string | null;
  name: string;
  order: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  sets: WorkoutSetDTO[];
}

export interface WorkoutSessionDTO {
  id: string;
  userId: string;
  workoutTemplateId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  startedAt: string;
  completedAt: string | null;
  abandonedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sessionExercises: WorkoutSessionExerciseDTO[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ProgressSummaryDTO {
  totalWorkouts: number;
  completedWorkouts: number;
  abandonedWorkouts: number;
  trainingDays: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  averageWorkoutDurationSeconds: number;
}

export interface TrainingFrequencyDTO {
  totalWorkouts: number;
  completedWorkouts: number;
  abandonedWorkouts: number;
  trainingDays: number;
  workoutsPerWeek: number;
}

export interface VolumeSummaryDTO {
  totalVolume: number;
  unit: string;
}

export interface ExerciseVolumeItemDTO {
  exerciseId: string | null;
  exerciseName: string;
  totalVolume: number;
}

export interface MuscleGroupVolumeItemDTO {
  muscleGroup: string;
  totalVolume: number;
}

export interface PersonalRecordItemDTO {
  exerciseId: string | null;
  exerciseName: string;
  maxWeight: number | null;
  maxReps: number | null;
  maxVolume: number | null;
  estimated1RM: number | null;
  achievedAt: string | null;
  sessionId: string | null;
  sessionExerciseId: string | null;
}

export interface ExerciseTrendPointDTO {
  date: string;
  bestWeight: number | null;
  bestReps: number | null;
  estimated1RM: number | null;
}

export interface ExercisePerformanceSummaryDTO {
  sessions: number;
  sets: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number | null;
  maxReps: number | null;
  estimated1RM: number | null;
}

export interface ExercisePerformanceDTO {
  exercise: {
    id: string | null;
    name: string;
  };
  summary: ExercisePerformanceSummaryDTO;
  recent: WorkoutSessionDTO[];
}

export interface ProgressDashboardDTO {
  summary: ProgressSummaryDTO;
  frequency: TrainingFrequencyDTO;
  totalVolume: VolumeSummaryDTO;
  topExercisesByVolume: ExerciseVolumeItemDTO[];
  recentWorkouts: WorkoutSessionDTO[];
  prHighlights: PersonalRecordItemDTO[];
}

// Phase 7 FUEL DTOs

export interface FoodDTO {
  id: string;
  name: string;
  description: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number | null;
  isActive: boolean;
  isCustom: boolean;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MealFoodEntryDTO {
  id: string;
  mealId: string;
  foodId: string | null;
  foodNameSnapshot: string;
  quantity: number;
  unit: string;
  servingSizeSnapshot: number;
  servingUnitSnapshot: string;
  caloriesPerServingSnapshot: number;
  proteinPerServingSnapshot: number;
  carbohydratesPerServingSnapshot: number;
  fatPerServingSnapshot: number;
  fiberPerServingSnapshot: number | null;
  caloriesSnapshot: number;
  proteinSnapshot: number;
  carbohydratesSnapshot: number;
  fatSnapshot: number;
  fiberSnapshot: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MealDTO {
  id: string;
  userId: string;
  name: string;
  mealDate: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'OTHER' | null;
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number | null;
  createdAt: string;
  updatedAt: string;
  entries: MealFoodEntryDTO[];
}

export interface NutritionDailySummaryDTO {
  date: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number | null;
  meals: number;
}

export interface NutritionTargetDTO {
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionTargetComparisonDTO {
  date: string;
  actual: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  target: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  } | null;
  remaining: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  } | null;
}


export interface ExerciseQueryParams {
  search?: string;
  muscleGroup?: string;
  equipment?: string;
  page?: number;
  limit?: number;
}

export interface WorkoutSessionQueryParams {
  page?: number;
  limit?: number;
  status?: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}

export interface ProgressDateRangeParams {
  from?: string;
  to?: string;
}

export interface FoodQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface MealQueryParams {
  page?: number;
  limit?: number;
  mealDate?: string;
}

export interface TargetQueryParams {
  page?: number;
  limit?: number;
}

export interface DateQueryParam {
  date?: string;
}

>>>>>>> b83a35e (Completed Phase 9)
