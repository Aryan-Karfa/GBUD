import { apiClient } from '../../../api/client';
import {
  ExerciseDTO,
  WorkoutTemplateDTO,
  WorkoutTemplateExerciseDTO,
  WorkoutSessionDTO,
  WorkoutSetDTO,
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
} from '../train.types';

export class TrainService {
  // --- Exercise Catalog ---

  public async listExercises(
    query?: Partial<ExerciseQueryInput>
  ): Promise<PaginatedResponseData<ExerciseDTO>> {
    return apiClient.train.listExercises(query);
  }

  public async getExercise(id: string): Promise<ExerciseDTO> {
    return apiClient.train.getExercise(id);
  }

  // --- Workout Templates ---

  public async listWorkoutTemplates(): Promise<WorkoutTemplateDTO[]> {
    return apiClient.train.listWorkoutTemplates();
  }

  public async getWorkoutTemplate(id: string): Promise<WorkoutTemplateDTO> {
    return apiClient.train.getWorkoutTemplate(id);
  }

  public async createWorkoutTemplate(
    input: CreateWorkoutTemplateInput
  ): Promise<WorkoutTemplateDTO> {
    return apiClient.train.createWorkoutTemplate(input);
  }

  public async updateWorkoutTemplate(
    id: string,
    input: UpdateWorkoutTemplateInput
  ): Promise<WorkoutTemplateDTO> {
    return apiClient.train.updateWorkoutTemplate(id, input);
  }

  public async deleteWorkoutTemplate(id: string): Promise<null> {
    return apiClient.train.deleteWorkoutTemplate(id);
  }

  public async addExerciseToTemplate(
    templateId: string,
    input: AddTemplateExerciseInput
  ): Promise<WorkoutTemplateExerciseDTO> {
    return apiClient.train.addExerciseToTemplate(templateId, input);
  }

  public async removeExerciseFromTemplate(
    templateId: string,
    templateExerciseId: string
  ): Promise<null> {
    return apiClient.train.removeExerciseFromTemplate(templateId, templateExerciseId);
  }

  public async reorderTemplateExercises(
    templateId: string,
    input: ReorderTemplateExercisesInput
  ): Promise<WorkoutTemplateDTO> {
    return apiClient.train.reorderTemplateExercises(templateId, input);
  }

  // --- Workout Sessions ---

  public async startWorkoutSession(
    input: CreateWorkoutSessionInput
  ): Promise<WorkoutSessionDTO> {
    return apiClient.train.startWorkoutSession(input);
  }

  public async getActiveWorkoutSession(): Promise<WorkoutSessionDTO | null> {
    return apiClient.train.getActiveWorkoutSession();
  }

  public async getWorkoutSession(id: string): Promise<WorkoutSessionDTO> {
    return apiClient.train.getWorkoutSession(id);
  }

  public async listWorkoutHistory(
    query?: Partial<WorkoutSessionQueryInput>
  ): Promise<PaginatedResponseData<WorkoutSessionDTO>> {
    return apiClient.train.listWorkoutHistory(query);
  }

  public async addWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    input: AddWorkoutSetInput
  ): Promise<WorkoutSetDTO> {
    return apiClient.train.addWorkoutSet(sessionId, sessionExerciseId, input);
  }

  public async updateWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    setId: string,
    input: UpdateWorkoutSetInput
  ): Promise<WorkoutSetDTO> {
    return apiClient.train.updateWorkoutSet(sessionId, sessionExerciseId, setId, input);
  }

  public async deleteWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    setId: string
  ): Promise<null> {
    return apiClient.train.deleteWorkoutSet(sessionId, sessionExerciseId, setId);
  }

  public async completeWorkoutSession(id: string): Promise<WorkoutSessionDTO> {
    return apiClient.train.completeWorkoutSession(id);
  }

  public async abandonWorkoutSession(id: string): Promise<WorkoutSessionDTO> {
    return apiClient.train.abandonWorkoutSession(id);
  }
}

export const trainService = new TrainService();
