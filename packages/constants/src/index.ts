export const API_ROUTES = {
  HEALTH: '/api/v1/health',
<<<<<<< HEAD
=======
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
  },
  TRAIN: {
    EXERCISES: '/api/v1/exercises',
    EXERCISE_BY_ID: (id: string) => `/api/v1/exercises/${id}`,
    WORKOUT_TEMPLATES: '/api/v1/workout-templates',
    WORKOUT_TEMPLATE_BY_ID: (id: string) => `/api/v1/workout-templates/${id}`,
    WORKOUT_TEMPLATE_EXERCISES: (templateId: string) => `/api/v1/workout-templates/${templateId}/exercises`,
    WORKOUT_TEMPLATE_EXERCISE_BY_ID: (templateId: string, templateExerciseId: string) =>
      `/api/v1/workout-templates/${templateId}/exercises/${templateExerciseId}`,
    WORKOUT_TEMPLATE_REORDER: (templateId: string) =>
      `/api/v1/workout-templates/${templateId}/exercises/reorder`,
    WORKOUT_SESSIONS: '/api/v1/workout-sessions',
    WORKOUT_SESSION_ACTIVE: '/api/v1/workout-sessions/active',
    WORKOUT_SESSION_BY_ID: (id: string) => `/api/v1/workout-sessions/${id}`,
    WORKOUT_SESSION_SETS: (sessionId: string, sessionExerciseId: string) =>
      `/api/v1/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/sets`,
    WORKOUT_SESSION_SET_BY_ID: (sessionId: string, sessionExerciseId: string, setId: string) =>
      `/api/v1/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/sets/${setId}`,
    WORKOUT_SESSION_COMPLETE: (id: string) => `/api/v1/workout-sessions/${id}/complete`,
    WORKOUT_SESSION_ABANDON: (id: string) => `/api/v1/workout-sessions/${id}/abandon`,
  },
  PROGRESS: {
    SUMMARY: '/api/v1/progress/summary',
    FREQUENCY: '/api/v1/progress/frequency',
    VOLUME: '/api/v1/progress/volume',
    VOLUME_EXERCISES: '/api/v1/progress/volume/exercises',
    VOLUME_MUSCLES: '/api/v1/progress/volume/muscles',
    PRS: '/api/v1/progress/prs',
    EXERCISE_PERFORMANCE: (exerciseId: string) => `/api/v1/progress/exercises/${exerciseId}`,
    EXERCISE_TREND: (exerciseId: string) => `/api/v1/progress/exercises/${exerciseId}/trend`,
    DASHBOARD: '/api/v1/progress/dashboard',
  },
  FUEL: {
    FOODS: '/api/v1/fuel/foods',
    FOOD_BY_ID: (id: string) => `/api/v1/fuel/foods/${id}`,
    MEALS: '/api/v1/fuel/meals',
    MEAL_BY_ID: (id: string) => `/api/v1/fuel/meals/${id}`,
    MEAL_FOODS: (mealId: string) => `/api/v1/fuel/meals/${mealId}/foods`,
    MEAL_FOOD_BY_ID: (mealId: string, entryId: string) => `/api/v1/fuel/meals/${mealId}/foods/${entryId}`,
    TARGETS: '/api/v1/fuel/targets',
    TARGET_CURRENT: '/api/v1/fuel/targets/current',
    TARGET_BY_ID: (id: string) => `/api/v1/fuel/targets/${id}`,
    SUMMARY: '/api/v1/fuel/summary',
    SUMMARY_COMPARE: '/api/v1/fuel/summary/compare',
    HISTORY: '/api/v1/fuel/history',
  },
>>>>>>> b83a35e (Completed Phase 9)
} as const;

export const PILLARS = {
  TRAIN: 'train',
  FUEL: 'fuel',
  PROGRESS: 'progress',
} as const;
<<<<<<< HEAD
=======

>>>>>>> b83a35e (Completed Phase 9)
