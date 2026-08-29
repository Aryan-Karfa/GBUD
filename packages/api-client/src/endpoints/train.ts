import { API_ROUTES } from '@gbud/constants';
import {
  ExerciseDTO,
  PaginatedResponseData,
  WorkoutSessionDTO,
  WorkoutSetDTO,
  WorkoutTemplateDTO,
  WorkoutTemplateExerciseDTO,
} from '@gbud/types';
import {
  AddTemplateExerciseInput,
  AddWorkoutSetInput,
  CreateWorkoutSessionInput,
  CreateWorkoutTemplateInput,
  ExerciseQueryInput,
  ReorderTemplateExercisesInput,
  UpdateWorkoutSetInput,
  UpdateWorkoutTemplateInput,
  WorkoutSessionQueryInput,
} from '@gbud/validation';
import { HttpClient } from '../client/http-client';
import { RequestOptions } from '../client/request';

export class TrainEndpointClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // --- Exercises ---

  public async listExercises(
    query?: Partial<ExerciseQueryInput>,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<PaginatedResponseData<ExerciseDTO>> {
    return this.http.get<PaginatedResponseData<ExerciseDTO>>(
      API_ROUTES.TRAIN.EXERCISES,
      { ...options, params: query as Record<string, unknown> }
    );
  }

  public async getExercise(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<ExerciseDTO> {
    return this.http.get<ExerciseDTO>(API_ROUTES.TRAIN.EXERCISE_BY_ID(id), options);
  }

  // --- Workout Templates ---

  public async listWorkoutTemplates(
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<WorkoutTemplateDTO[]> {
    return this.http.get<WorkoutTemplateDTO[]>(API_ROUTES.TRAIN.WORKOUT_TEMPLATES, options);
  }

  public async getWorkoutTemplate(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<WorkoutTemplateDTO> {
    return this.http.get<WorkoutTemplateDTO>(API_ROUTES.TRAIN.WORKOUT_TEMPLATE_BY_ID(id), options);
  }

  public async createWorkoutTemplate(
    input: CreateWorkoutTemplateInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutTemplateDTO> {
    return this.http.post<WorkoutTemplateDTO>(
      API_ROUTES.TRAIN.WORKOUT_TEMPLATES,
      input,
      options
    );
  }

  public async updateWorkoutTemplate(
    id: string,
    input: UpdateWorkoutTemplateInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutTemplateDTO> {
    return this.http.patch<WorkoutTemplateDTO>(
      API_ROUTES.TRAIN.WORKOUT_TEMPLATE_BY_ID(id),
      input,
      options
    );
  }

  public async deleteWorkoutTemplate(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<null> {
    return this.http.delete<null>(API_ROUTES.TRAIN.WORKOUT_TEMPLATE_BY_ID(id), options);
  }

  public async addExerciseToTemplate(
    templateId: string,
    input: AddTemplateExerciseInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutTemplateExerciseDTO> {
    return this.http.post<WorkoutTemplateExerciseDTO>(
      API_ROUTES.TRAIN.WORKOUT_TEMPLATE_EXERCISES(templateId),
      input,
      options
    );
  }

  public async removeExerciseFromTemplate(
    templateId: string,
    templateExerciseId: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<null> {
    return this.http.delete<null>(
      API_ROUTES.TRAIN.WORKOUT_TEMPLATE_EXERCISE_BY_ID(templateId, templateExerciseId),
      options
    );
  }

  public async reorderTemplateExercises(
    templateId: string,
    input: ReorderTemplateExercisesInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutTemplateDTO> {
    return this.http.patch<WorkoutTemplateDTO>(
      API_ROUTES.TRAIN.WORKOUT_TEMPLATE_REORDER(templateId),
      input,
      options
    );
  }

  // --- Workout Sessions ---

  public async startWorkoutSession(
    input: CreateWorkoutSessionInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutSessionDTO> {
    return this.http.post<WorkoutSessionDTO>(
      API_ROUTES.TRAIN.WORKOUT_SESSIONS,
      input,
      options
    );
  }

  public async getActiveWorkoutSession(
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<WorkoutSessionDTO | null> {
    return this.http.get<WorkoutSessionDTO | null>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_ACTIVE,
      options
    );
  }

  public async getWorkoutSession(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<WorkoutSessionDTO> {
    return this.http.get<WorkoutSessionDTO>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_BY_ID(id),
      options
    );
  }

  public async listWorkoutHistory(
    query?: Partial<WorkoutSessionQueryInput>,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<PaginatedResponseData<WorkoutSessionDTO>> {
    return this.http.get<PaginatedResponseData<WorkoutSessionDTO>>(
      API_ROUTES.TRAIN.WORKOUT_SESSIONS,
      { ...options, params: query as Record<string, unknown> }
    );
  }

  public async addWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    input: AddWorkoutSetInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutSetDTO> {
    return this.http.post<WorkoutSetDTO>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_SETS(sessionId, sessionExerciseId),
      input,
      options
    );
  }

  public async updateWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    setId: string,
    input: UpdateWorkoutSetInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<WorkoutSetDTO> {
    return this.http.patch<WorkoutSetDTO>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_SET_BY_ID(sessionId, sessionExerciseId, setId),
      input,
      options
    );
  }

  public async deleteWorkoutSet(
    sessionId: string,
    sessionExerciseId: string,
    setId: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<null> {
    return this.http.delete<null>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_SET_BY_ID(sessionId, sessionExerciseId, setId),
      options
    );
  }

  public async completeWorkoutSession(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<WorkoutSessionDTO> {
    return this.http.post<WorkoutSessionDTO>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_COMPLETE(id),
      undefined,
      options
    );
  }

  public async abandonWorkoutSession(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<WorkoutSessionDTO> {
    return this.http.post<WorkoutSessionDTO>(
      API_ROUTES.TRAIN.WORKOUT_SESSION_ABANDON(id),
      undefined,
      options
    );
  }
}
