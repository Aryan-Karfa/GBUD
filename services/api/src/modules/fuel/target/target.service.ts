import { NutritionTargetInput, UpdateNutritionTargetInput } from '@gbud/validation';
import { NutritionTargetDTO, PaginatedResponseData } from '@gbud/types';
import { nutritionTargetRepository } from '../../../repositories/nutrition-target.repository';
import { AppError } from '../../../utils/app-error';
import { NutritionTarget } from '@prisma/client';

export class TargetService {
  private mapToDTO(target: NutritionTarget): NutritionTargetDTO {
    return {
      id: target.id,
      userId: target.userId,
      calories: target.calories,
      protein: target.protein,
      carbohydrates: target.carbohydrates,
      fat: target.fat,
      effectiveFrom: target.effectiveFrom.toISOString().split('T')[0],
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
    };
  }

  public async createTarget(userId: string, input: NutritionTargetInput): Promise<NutritionTargetDTO> {
    try {
      const target = await nutritionTargetRepository.createTarget(userId, input);
      return this.mapToDTO(target);
    } catch (error: any) {
      if (error.message === 'DUPLICATE_TARGET_DATE') {
        throw AppError.conflict('A nutrition target already exists for this effectiveFrom date');
      }
      throw error;
    }
  }

  public async getCurrentTarget(userId: string, dateStr?: string): Promise<NutritionTargetDTO | null> {
    const queryDate = dateStr || new Date().toISOString().split('T')[0];
    const target = await nutritionTargetRepository.findCurrentTargetForDate(userId, queryDate);
    if (!target) return null;

    return this.mapToDTO(target);
  }

  public async listTargets(
    userId: string,
    query: { page?: number; limit?: number }
  ): Promise<PaginatedResponseData<NutritionTargetDTO>> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const { items, total } = await nutritionTargetRepository.findAllTargetsByUserId(userId, { page, limit });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((t) => this.mapToDTO(t)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  public async updateTarget(
    id: string,
    userId: string,
    input: UpdateNutritionTargetInput
  ): Promise<NutritionTargetDTO> {
    try {
      const updated = await nutritionTargetRepository.updateTarget(id, userId, input);
      if (!updated) {
        throw AppError.notFound('Nutrition target not found');
      }
      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'HISTORICAL_TARGET_IMMUTABLE') {
        throw AppError.conflict('Historical targets cannot be modified. Create a new target instead');
      }
      throw error;
    }
  }

  public async deleteTarget(id: string, userId: string): Promise<void> {
    const deleted = await nutritionTargetRepository.deleteTarget(id, userId);
    if (!deleted) {
      throw AppError.notFound('Nutrition target not found');
    }
  }
}

export const targetService = new TargetService();
