import { z } from 'zod';

export { z };

export const testBodySchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
});

export type TestBodyInput = z.infer<typeof testBodySchema>;
<<<<<<< HEAD
=======

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .transform((val) => val.trim().toLowerCase()),
  username: z
    .string({ required_error: 'Username is required' })
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .transform((val) => val.trim()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .transform((val) => val.trim().toLowerCase()),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token cannot be empty').optional(),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

export const exerciseQuerySchema = z.object({
  search: z.string().optional(),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ExerciseQueryInput = z.infer<typeof exerciseQuerySchema>;

export const createWorkoutTemplateSchema = z.object({
  name: z
    .string({ required_error: 'Template name is required' })
    .trim()
    .min(1, 'Template name cannot be empty')
    .max(100, 'Template name cannot exceed 100 characters'),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type CreateWorkoutTemplateInput = z.infer<typeof createWorkoutTemplateSchema>;

export const updateWorkoutTemplateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Template name cannot be empty')
    .max(100, 'Template name cannot exceed 100 characters')
    .optional(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
});

export type UpdateWorkoutTemplateInput = z.infer<typeof updateWorkoutTemplateSchema>;

export const addTemplateExerciseSchema = z.object({
  exerciseId: z
    .string({ required_error: 'Exercise ID is required' })
    .min(1, 'Exercise ID cannot be empty'),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export type AddTemplateExerciseInput = z.infer<typeof addTemplateExerciseSchema>;

export const reorderTemplateExercisesSchema = z.object({
  exerciseIds: z
    .array(z.string().min(1, 'Invalid exercise ID'), {
      required_error: 'exerciseIds array is required',
    })
    .min(1, 'At least one exercise ID is required')
    .refine((items) => new Set(items).size === items.length, {
      message: 'exerciseIds cannot contain duplicates',
    }),
});

export type ReorderTemplateExercisesInput = z.infer<typeof reorderTemplateExercisesSchema>;

export const createWorkoutSessionSchema = z.object({
  workoutTemplateId: z
    .string({ required_error: 'workoutTemplateId is required' })
    .min(1, 'workoutTemplateId cannot be empty'),
});

export type CreateWorkoutSessionInput = z.infer<typeof createWorkoutSessionSchema>;

const setInputRefinement = (data: { reps?: number; weight?: number }) =>
  data.reps !== undefined || data.weight !== undefined;

export const addWorkoutSetSchema = z
  .object({
    reps: z.number({ invalid_type_error: 'Reps must be a number' }).int('Reps must be an integer').positive('Reps must be a positive integer').optional(),
    weight: z.number({ invalid_type_error: 'Weight must be a number' }).min(0, 'Weight must be a non-negative number').optional(),
  })
  .refine(setInputRefinement, {
    message: 'At least one of reps or weight must be provided',
  });

export type AddWorkoutSetInput = z.infer<typeof addWorkoutSetSchema>;

export const updateWorkoutSetSchema = z
  .object({
    reps: z.number({ invalid_type_error: 'Reps must be a number' }).int('Reps must be an integer').positive('Reps must be a positive integer').optional(),
    weight: z.number({ invalid_type_error: 'Weight must be a number' }).min(0, 'Weight must be a non-negative number').optional(),
  })
  .refine(setInputRefinement, {
    message: 'At least one of reps or weight must be provided',
  });

export type UpdateWorkoutSetInput = z.infer<typeof updateWorkoutSetSchema>;

export const workoutSessionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED']).optional(),
});

export type WorkoutSessionQueryInput = z.infer<typeof workoutSessionQuerySchema>;

export const progressDateRangeSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        const fromDate = new Date(data.from);
        const toDate = new Date(data.to);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          return false;
        }
        return fromDate <= toDate;
      }
      if (data.from && isNaN(new Date(data.from).getTime())) return false;
      if (data.to && isNaN(new Date(data.to).getTime())) return false;
      return true;
    },
    {
      message: "Invalid date range: 'from' date must be earlier than or equal to 'to' date",
    }
  );

export type ProgressDateRangeInput = z.infer<typeof progressDateRangeSchema>;

// Phase 7 FUEL Schemas

export const createFoodSchema = z.object({
  name: z.string({ required_error: 'Food name is required' }).trim().min(1, 'Food name cannot be empty').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().trim().max(500).optional(),
  servingSize: z.number({ required_error: 'servingSize is required' }).positive('servingSize must be a positive number'),
  servingUnit: z.string({ required_error: 'servingUnit is required' }).trim().min(1, 'servingUnit cannot be empty'),
  calories: z.number({ required_error: 'calories is required' }).min(0, 'calories must be a non-negative number'),
  protein: z.number({ required_error: 'protein is required' }).min(0, 'protein must be a non-negative number'),
  carbohydrates: z.number({ required_error: 'carbohydrates is required' }).min(0, 'carbohydrates must be a non-negative number'),
  fat: z.number({ required_error: 'fat is required' }).min(0, 'fat must be a non-negative number'),
  fiber: z.number().min(0, 'fiber must be a non-negative number').optional(),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;

export const updateFoodSchema = z.object({
  name: z.string().trim().min(1, 'Food name cannot be empty').max(100).optional(),
  description: z.string().trim().max(500).optional(),
  servingSize: z.number().positive('servingSize must be a positive number').optional(),
  servingUnit: z.string().trim().min(1).optional(),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
});

export type UpdateFoodInput = z.infer<typeof updateFoodSchema>;

export const foodQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type FoodQueryInput = z.infer<typeof foodQuerySchema>;

export const createMealSchema = z.object({
  name: z.string({ required_error: 'Meal name is required' }).trim().min(1, 'Meal name cannot be empty').max(100),
  mealDate: z
    .string({ required_error: 'mealDate is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'mealDate must be in YYYY-MM-DD format'),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']).optional(),
});

export type CreateMealInput = z.infer<typeof createMealSchema>;

export const updateMealSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'mealDate must be in YYYY-MM-DD format').optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']).optional(),
});

export type UpdateMealInput = z.infer<typeof updateMealSchema>;

export const addMealFoodEntrySchema = z.object({
  foodId: z.string({ required_error: 'foodId is required' }).min(1, 'foodId cannot be empty'),
  quantity: z.number({ required_error: 'quantity is required' }).positive('quantity must be a positive number'),
  unit: z.string({ required_error: 'unit is required' }).trim().min(1, 'unit cannot be empty'),
});

export type AddMealFoodEntryInput = z.infer<typeof addMealFoodEntrySchema>;

export const updateMealFoodEntrySchema = z.object({
  quantity: z.number({ required_error: 'quantity is required' }).positive('quantity must be a positive number'),
  unit: z.string().trim().min(1).optional(),
});

export type UpdateMealFoodEntryInput = z.infer<typeof updateMealFoodEntrySchema>;

export const nutritionTargetSchema = z.object({
  calories: z.number({ required_error: 'calories is required' }).min(0, 'calories must be non-negative'),
  protein: z.number({ required_error: 'protein is required' }).min(0, 'protein must be non-negative'),
  carbohydrates: z.number({ required_error: 'carbohydrates is required' }).min(0, 'carbohydrates must be non-negative'),
  fat: z.number({ required_error: 'fat is required' }).min(0, 'fat must be non-negative'),
  effectiveFrom: z
    .string({ required_error: 'effectiveFrom is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'effectiveFrom must be in YYYY-MM-DD format'),
});

export type NutritionTargetInput = z.infer<typeof nutritionTargetSchema>;

export const updateNutritionTargetSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbohydrates: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
});

export type UpdateNutritionTargetInput = z.infer<typeof updateNutritionTargetSchema>;

export const mealQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'mealDate must be in YYYY-MM-DD format').optional(),
});

export type MealQueryInput = z.infer<typeof mealQuerySchema>;

export const targetQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TargetQueryInput = z.infer<typeof targetQuerySchema>;



>>>>>>> b83a35e (Completed Phase 9)
