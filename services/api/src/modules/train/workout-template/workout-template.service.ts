import {
  CreateWorkoutTemplateInput,
  UpdateWorkoutTemplateInput,
  AddTemplateExerciseInput,
  ReorderTemplateExercisesInput,
} from '@gbud/validation';
import { WorkoutTemplateDTO, WorkoutTemplateExerciseDTO } from '@gbud/types';
import {
  workoutTemplateRepository,
  TemplateWithExercises,
} from '../../../repositories/workout-template.repository';
import { AppError } from '../../../utils/app-error';

export class WorkoutTemplateService {
  private mapToDTO(template: TemplateWithExercises): WorkoutTemplateDTO {
    return {
      id: template.id,
      userId: template.userId,
      name: template.name,
      description: template.description,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      exercises: template.templateExercises.map((te): WorkoutTemplateExerciseDTO => ({
        id: te.id,
        workoutTemplateId: te.workoutTemplateId,
        exerciseId: te.exerciseId,
        order: te.order,
        notes: te.notes,
        createdAt: te.createdAt.toISOString(),
        updatedAt: te.updatedAt.toISOString(),
        exercise: {
          id: te.exercise.id,
          name: te.exercise.name,
          description: te.exercise.description,
          muscleGroup: te.exercise.muscleGroup,
          equipment: te.exercise.equipment,
          movementPattern: te.exercise.movementPattern,
          exerciseType: te.exercise.exerciseType,
          instructions: te.exercise.instructions,
          isActive: te.exercise.isActive,
          createdAt: te.exercise.createdAt.toISOString(),
          updatedAt: te.exercise.updatedAt.toISOString(),
        },
      })),
    };
  }

  public async createTemplate(userId: string, input: CreateWorkoutTemplateInput): Promise<WorkoutTemplateDTO> {
    const template = await workoutTemplateRepository.create(userId, {
      name: input.name,
      description: input.description,
    });
    return this.mapToDTO(template);
  }

  public async getUserTemplates(userId: string): Promise<WorkoutTemplateDTO[]> {
    const templates = await workoutTemplateRepository.findAllByUserId(userId);
    return templates.map((t) => this.mapToDTO(t));
  }

  public async getTemplateById(id: string, userId: string): Promise<WorkoutTemplateDTO> {
    const template = await workoutTemplateRepository.findByIdAndUserId(id, userId);
    if (!template) {
      throw AppError.notFound('Workout template not found');
    }
    return this.mapToDTO(template);
  }

  public async updateTemplate(
    id: string,
    userId: string,
    input: UpdateWorkoutTemplateInput
  ): Promise<WorkoutTemplateDTO> {
    const updated = await workoutTemplateRepository.update(id, userId, {
      name: input.name,
      description: input.description,
    });
    if (!updated) {
      throw AppError.notFound('Workout template not found');
    }
    return this.mapToDTO(updated);
  }

  public async deleteTemplate(id: string, userId: string): Promise<void> {
    const deleted = await workoutTemplateRepository.delete(id, userId);
    if (!deleted) {
      throw AppError.notFound('Workout template not found');
    }
  }

  public async addExerciseToTemplate(
    templateId: string,
    userId: string,
    input: AddTemplateExerciseInput
  ): Promise<WorkoutTemplateDTO> {
    try {
      const updated = await workoutTemplateRepository.addExercise(templateId, userId, input.exerciseId, input.notes);
      if (!updated) {
        throw AppError.notFound('Workout template or exercise not found');
      }
      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'DUPLICATE_EXERCISE_IN_TEMPLATE') {
        throw AppError.conflict('Exercise is already present in this template');
      }
      throw error;
    }
  }

  public async removeExerciseFromTemplate(
    templateId: string,
    userId: string,
    templateExerciseId: string
  ): Promise<WorkoutTemplateDTO> {
    const updated = await workoutTemplateRepository.removeExercise(templateId, userId, templateExerciseId);
    if (!updated) {
      throw AppError.notFound('Workout template or exercise relationship not found');
    }
    return this.mapToDTO(updated);
  }

  public async reorderTemplateExercises(
    templateId: string,
    userId: string,
    input: ReorderTemplateExercisesInput
  ): Promise<WorkoutTemplateDTO> {
    try {
      const updated = await workoutTemplateRepository.reorderExercisesAtomic(
        templateId,
        userId,
        input.exerciseIds
      );
      if (!updated) {
        throw AppError.notFound('Workout template not found');
      }
      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'INVALID_REORDER_IDS') {
        throw AppError.badRequest('Invalid or mismatched exercise IDs supplied for reordering');
      }
      throw error;
    }
  }
}

export const workoutTemplateService = new WorkoutTemplateService();
