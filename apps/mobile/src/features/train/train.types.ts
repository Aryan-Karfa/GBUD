import {
  ExerciseDTO,
  WorkoutTemplateDTO,
  WorkoutTemplateExerciseDTO,
  WorkoutSessionDTO,
  WorkoutSessionExerciseDTO,
  WorkoutSetDTO,
  PaginationMeta,
  PaginatedResponseData,
} from '@gbud/types';
import {
  CreateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
  AddTemplateExerciseInput,
  ReorderTemplateExercisesInput,
  CreateWorkoutSessionInput,
  AddWorkoutSetInput,
  UpdateWorkoutSetInput,
  WorkoutSessionQueryInput,
  ExerciseQueryInput,
} from '@gbud/validation';

export type {
  ExerciseDTO,
  WorkoutTemplateDTO,
  WorkoutTemplateExerciseDTO,
  WorkoutSessionDTO,
  WorkoutSessionExerciseDTO,
  WorkoutSetDTO,
  PaginationMeta,
  PaginatedResponseData,
  CreateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
  AddTemplateExerciseInput,
  ReorderTemplateExercisesInput,
  CreateWorkoutSessionInput,
  AddWorkoutSetInput,
  UpdateWorkoutSetInput,
  WorkoutSessionQueryInput,
  ExerciseQueryInput,
};

export type TrainScreen =
  | 'TrainHome'
  | 'ExerciseLibrary'
  | 'ExerciseDetail'
  | 'WorkoutTemplates'
  | 'WorkoutTemplateDetail'
  | 'WorkoutTemplateEditor'
  | 'ActiveWorkout'
  | 'WorkoutHistory'
  | 'WorkoutHistoryDetail';

export interface TrainRouteParams {
  TrainHome: undefined;
  ExerciseLibrary: undefined;
  ExerciseDetail: { exerciseId: string };
  WorkoutTemplates: undefined;
  WorkoutTemplateDetail: { templateId: string };
  WorkoutTemplateEditor: { templateId?: string } | undefined;
  ActiveWorkout: { sessionId?: string };
  WorkoutHistory: undefined;
  WorkoutHistoryDetail: { sessionId: string };
}

export interface ExerciseFilterState {
  search: string;
  muscleGroup?: string;
  equipment?: string;
}

export interface TemplateEditorExerciseItem {
  exerciseId: string;
  exerciseName: string;
  muscleGroup?: string | null;
  notes?: string;
}

export interface SetFormValues {
  reps?: number;
  weight?: number;
}
