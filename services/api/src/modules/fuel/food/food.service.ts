import { FoodQueryInput, CreateFoodInput, UpdateFoodInput } from '@gbud/validation';
import { FoodDTO, PaginatedResponseData } from '@gbud/types';
import { foodRepository } from '../../../repositories/food.repository';
import { AppError } from '../../../utils/app-error';
import { Food } from '@prisma/client';

export class FoodService {
  private mapToDTO(food: Food): FoodDTO {
    return {
      id: food.id,
      name: food.name,
      description: food.description,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
      fiber: food.fiber,
      isActive: food.isActive,
      isCustom: food.ownerId !== null,
      ownerId: food.ownerId,
      createdAt: food.createdAt.toISOString(),
      updatedAt: food.updatedAt.toISOString(),
    };
  }

  public async listFoods(
    userId: string,
    query: FoodQueryInput
  ): Promise<PaginatedResponseData<FoodDTO>> {
    const { items, total } = await foodRepository.findAll(userId, query);
    const totalPages = Math.ceil(total / query.limit) || 1;

    return {
      items: items.map((f) => this.mapToDTO(f)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  public async getFoodById(id: string, userId: string): Promise<FoodDTO> {
    const food = await foodRepository.findById(id, userId);
    if (!food) {
      throw AppError.notFound('Food item not found');
    }
    return this.mapToDTO(food);
  }

  public async createCustomFood(userId: string, input: CreateFoodInput): Promise<FoodDTO> {
    const food = await foodRepository.createCustomFood(userId, input);
    return this.mapToDTO(food);
  }

  public async updateCustomFood(id: string, userId: string, input: UpdateFoodInput): Promise<FoodDTO> {
    try {
      const updated = await foodRepository.updateCustomFood(id, userId, input);
      if (!updated) {
        throw AppError.notFound('Food item not found');
      }
      return this.mapToDTO(updated);
    } catch (error: any) {
      if (error.message === 'SYSTEM_FOOD_IMMUTABLE') {
        throw AppError.forbidden('System foods cannot be modified by users');
      }
      throw error;
    }
  }

  public async deleteCustomFood(id: string, userId: string): Promise<void> {
    try {
      const deleted = await foodRepository.softDeleteCustomFood(id, userId);
      if (!deleted) {
        throw AppError.notFound('Food item not found');
      }
    } catch (error: any) {
      if (error.message === 'SYSTEM_FOOD_IMMUTABLE') {
        throw AppError.forbidden('System foods cannot be deleted by users');
      }
      throw error;
    }
  }
}

export const foodService = new FoodService();
