import { apiClient } from '../../../api/client';
import {
  FoodDTO,
  MealDTO,
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  NutritionTargetDTO,
  PaginatedResponseData,
  CreateFoodInput,
  UpdateFoodInput,
  FoodQueryInput,
  CreateMealInput,
  UpdateMealInput,
  AddMealFoodEntryInput,
  UpdateMealFoodEntryInput,
  NutritionTargetInput,
  UpdateNutritionTargetInput,
  MealQueryInput,
  TargetQueryInput,
  ProgressDateRangeInput,
} from '../fuel.types';

export class FuelService {
  // --- Foods ---

  public async listFoods(query?: Partial<FoodQueryInput>): Promise<PaginatedResponseData<FoodDTO>> {
    return apiClient.fuel.listFoods(query);
  }

  public async getFood(id: string): Promise<FoodDTO> {
    return apiClient.fuel.getFood(id);
  }

  public async createCustomFood(input: CreateFoodInput): Promise<FoodDTO> {
    return apiClient.fuel.createFood(input);
  }

  public async updateCustomFood(id: string, input: UpdateFoodInput): Promise<FoodDTO> {
    return apiClient.fuel.updateFood(id, input);
  }

  public async deactivateCustomFood(id: string): Promise<null> {
    return apiClient.fuel.deleteFood(id);
  }

  // --- Meals ---

  public async listMeals(query?: Partial<MealQueryInput>): Promise<PaginatedResponseData<MealDTO>> {
    return apiClient.fuel.listMeals(query);
  }

  public async getMeal(id: string): Promise<MealDTO> {
    return apiClient.fuel.getMeal(id);
  }

  public async createMeal(input: CreateMealInput): Promise<MealDTO> {
    return apiClient.fuel.createMeal(input);
  }

  public async updateMeal(id: string, input: UpdateMealInput): Promise<MealDTO> {
    return apiClient.fuel.updateMeal(id, input);
  }

  public async deleteMeal(id: string): Promise<null> {
    return apiClient.fuel.deleteMeal(id);
  }

  // --- Meal Food Entries ---

  public async addFoodToMeal(mealId: string, input: AddMealFoodEntryInput): Promise<MealDTO> {
    return apiClient.fuel.addMealFoodEntry(mealId, input);
  }

  public async updateMealFoodEntry(
    mealId: string,
    entryId: string,
    input: UpdateMealFoodEntryInput
  ): Promise<MealDTO> {
    return apiClient.fuel.updateMealFoodEntry(mealId, entryId, input);
  }

  public async removeMealFoodEntry(mealId: string, entryId: string): Promise<MealDTO> {
    return apiClient.fuel.deleteMealFoodEntry(mealId, entryId);
  }

  // --- Targets ---

  public async getCurrentNutritionTarget(date?: string): Promise<NutritionTargetDTO | null> {
    return apiClient.fuel.getCurrentNutritionTarget(date);
  }

  public async listNutritionTargets(
    query?: Partial<TargetQueryInput>
  ): Promise<PaginatedResponseData<NutritionTargetDTO>> {
    return apiClient.fuel.listNutritionTargets(query);
  }

  public async createNutritionTarget(input: NutritionTargetInput): Promise<NutritionTargetDTO> {
    return apiClient.fuel.createNutritionTarget(input);
  }

  public async updateNutritionTarget(
    id: string,
    input: UpdateNutritionTargetInput
  ): Promise<NutritionTargetDTO> {
    return apiClient.fuel.updateNutritionTarget(id, input);
  }

  public async deleteNutritionTarget(id: string): Promise<null> {
    return apiClient.fuel.deleteNutritionTarget(id);
  }

  // --- Daily Summary & History ---

  public async getDailySummary(date?: string): Promise<NutritionDailySummaryDTO> {
    return apiClient.fuel.getFuelSummary(date);
  }

  public async compareFuelSummary(date?: string): Promise<NutritionTargetComparisonDTO> {
    return apiClient.fuel.compareFuelSummary(date);
  }

  public async getFuelHistory(query?: ProgressDateRangeInput): Promise<NutritionDailySummaryDTO[]> {
    return apiClient.fuel.getFuelHistory(query);
  }
}

export const fuelService = new FuelService();
