import {
  CreateWorkoutSessionInput,
  AddWorkoutSetInput,
  UpdateWorkoutSetInput,
  WorkoutSessionQueryInput,
} from '@gbud/validation';
import {
  WorkoutSessionDTO,
  WorkoutSessionExerciseDTO,
  WorkoutSetDTO,
  PaginatedResponseData,
} from '@gbud/types';
import {
  workoutSessionRepository,
  SessionWithHierarchy,
} from '../../../repositories/workout-session.repository';
import { workoutTemplateRepository } from '../../../repositories/workout-template.repository';
import { AppError } from '../../../utils/app-error';

export class WorkoutSessionService {
  private mapToDTO(session: SessionWithHierarchy): WorkoutSessionDTO {
    return {
      id: session.id,
      userId: session.userId,
      workoutTemplateId: session.workoutTemplateId,
      status: session.status as 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED',
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt ? session.completedAt.toISOString() : null,
      abandonedAt: session.abandonedAt ? session.abandonedAt.toISOString() : null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      sessionExercises: session.sessionExercises.map((se): WorkoutSessionExerciseDTO => ({
        id: se.id,
        workoutSessionId: se.workoutSessionId,
        exerciseId: se.exerciseId,
        name: se.name,
        order: se.order,
        notes: se.notes,
        createdAt: se.createdAt.toISOString(),
        updatedAt: se.updatedAt.toISOString(),
        sets: se.sets.map((s): WorkoutSetDTO => ({
          id: s.id,
          workoutSessionExerciseId: s.workoutSessionExerciseId,
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
      })),
    };
  }

  public async startWorkout(userId: string, input: CreateWorkoutSessionInput): Promise<WorkoutSessionDTO> {
    const active = await workoutSessionRepository.findActiveByUserId(userId);
    if (active) {
      throw AppError.conflict('User already has an active workout session in progress');
    }

    const template = await workoutTemplateRepository.findByIdAndUserId(input.workoutTemplateId, userId);
    if (!template) {
      throw AppError.notFound('Workout template not found');
    }

    if (template.templateExercises.length === 0) {
      throw AppError.badRequest('Cannot start workout session from an empty template');
    }

    try {
      const session = await workoutSessionRepository.createSessionWithSnapshot(userId, template);
      return this.mapToDTO(session);
    } catch (error: any) {
      if (error.message === 'DUPLICATE_ACTIVE_SESSION') {
        throw AppError.conflict('User already has an active workout session in progress');
      }
      throw error;
    }
  }

  public async getActiveWorkout(userId: string): Promise<WorkoutSessionDTO> {
    const active = await workoutSessionRepository.findActiveByUserId(userId);
    if (!active) {
      throw AppError.notFound('No active workout session found');
    }
    return this.mapToDTO(active);
  }

  public async getWorkoutSessionById(id: string, userId: string): Promise<WorkoutSessionDTO> {
    const session = await workoutSessionRepository.findByIdAndUserId(id, userId);
    if (!session) {
      throw AppError.notFound('Workout session not found');
    }
    return this.mapToDTO(session);
  }

  public async listWorkoutHistory(
    userId: string,
    query: WorkoutSessionQueryInput
  ): Promise<PaginatedResponseData<WorkoutSessionDTO>> {
    const { items, total } = await workoutSessionRepository.findHistoryByUserId(userId, {
      page: query.page,
      limit: query.limit,
      status: query.status,
    });

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      items: items.map((s) => this.mapToDTO(s)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  public async addSet(
    sessionId: string,
    userId: string,
    sessionExerciseId: string,
    input: AddWorkoutSetInput
  ): Promise<WorkoutSessionDTO> {
    try {
      const updated = await workoutSessionRepository.addSet(sessionId, userId, sessionExerciseId, {
        reps: input.reps,
        weight: input.weight,
      });

      if (!updated) {
        throw AppError.notFound('Workout session or exercise not found');
      }

      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'SESSION_NOT_IN_PROGRESS') {
        throw AppError.badRequest('Cannot add set to a completed or abandoned workout session');
      }
      throw error;
    }
  }

  public async updateSet(
    sessionId: string,
    userId: string,
    sessionExerciseId: string,
    setId: string,
    input: UpdateWorkoutSetInput
  ): Promise<WorkoutSessionDTO> {
    try {
      const updated = await workoutSessionRepository.updateSet(sessionId, userId, sessionExerciseId, setId, {
        reps: input.reps,
        weight: input.weight,
      });

      if (!updated) {
        throw AppError.notFound('Workout session, exercise, or set not found');
      }

      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'SESSION_NOT_IN_PROGRESS') {
        throw AppError.badRequest('Cannot update set in a completed or abandoned workout session');
      }
      throw error;
    }
  }

  public async deleteSet(
    sessionId: string,
    userId: string,
    sessionExerciseId: string,
    setId: string
  ): Promise<WorkoutSessionDTO> {
    try {
      const updated = await workoutSessionRepository.deleteSet(sessionId, userId, sessionExerciseId, setId);

      if (!updated) {
        throw AppError.notFound('Workout session, exercise, or set not found');
      }

      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'SESSION_NOT_IN_PROGRESS') {
        throw AppError.badRequest('Cannot delete set from a completed or abandoned workout session');
      }
      throw error;
    }
  }

  public async completeWorkout(sessionId: string, userId: string): Promise<WorkoutSessionDTO> {
    try {
      const completed = await workoutSessionRepository.completeSession(sessionId, userId);
      if (!completed) {
        throw AppError.notFound('Workout session not found');
      }

      return this.mapToDTO(completed);
    } catch (error: any) {
      if (error.message.startsWith('INVALID_STATE_TRANSITION')) {
        throw AppError.badRequest('Workout session is not in progress and cannot be completed');
      }
      throw error;
    }
  }

  public async abandonWorkout(sessionId: string, userId: string): Promise<WorkoutSessionDTO> {
    try {
      const abandoned = await workoutSessionRepository.abandonSession(sessionId, userId);
      if (!abandoned) {
        throw AppError.notFound('Workout session not found');
      }

      return this.mapToDTO(abandoned);
    } catch (error: any) {
      if (error.message.startsWith('INVALID_STATE_TRANSITION')) {
        throw AppError.badRequest('Workout session is not in progress and cannot be abandoned');
      }
      throw error;
    }
  }
}

export const workoutSessionService = new WorkoutSessionService();
