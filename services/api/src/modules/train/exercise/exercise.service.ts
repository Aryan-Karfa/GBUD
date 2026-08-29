import { ExerciseQueryInput } from '@gbud/validation';
import { ExerciseDTO, PaginatedResponseData } from '@gbud/types';
import { exerciseRepository } from '../../../repositories/exercise.repository';
import { AppError } from '../../../utils/app-error';

export class ExerciseService {
  private mapToDTO(exercise: any): ExerciseDTO {
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      movementPattern: exercise.movementPattern,
      exerciseType: exercise.exerciseType,
      instructions: exercise.instructions,
      isActive: exercise.isActive,
      createdAt: exercise.createdAt.toISOString(),
      updatedAt: exercise.updatedAt.toISOString(),
    };
  }

  public async listExercises(query: ExerciseQueryInput): Promise<PaginatedResponseData<ExerciseDTO>> {
    const { items, total } = await exerciseRepository.findAll({
      search: query.search,
      muscleGroup: query.muscleGroup,
      equipment: query.equipment,
      page: query.page,
      limit: query.limit,
    });

    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      items: items.map(this.mapToDTO),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  public async getExerciseById(id: string): Promise<ExerciseDTO> {
    const exercise = await exerciseRepository.findById(id);
    if (!exercise || !exercise.isActive) {
      throw AppError.notFound('Exercise not found');
    }
    return this.mapToDTO(exercise);
  }
}

export const exerciseService = new ExerciseService();
