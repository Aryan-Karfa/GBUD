import { API_ROUTES } from '@gbud/constants';
import {
  FoodDTO,
  MealDTO,
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  NutritionTargetDTO,
  PaginatedResponseData,
} from '@gbud/types';
import {
  AddMealFoodEntryInput,
  CreateFoodInput,
  CreateMealInput,
  FoodQueryInput,
  MealQueryInput,
  NutritionTargetInput,
  ProgressDateRangeInput,
  TargetQueryInput,
  UpdateFoodInput,
  UpdateMealFoodEntryInput,
  UpdateMealInput,
  UpdateNutritionTargetInput,
} from '@gbud/validation';
import { HttpClient } from '../client/http-client';
import { RequestOptions } from '../client/request';

export class FuelEndpointClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // --- Foods Catalog ---

  public async listFoods(
    query?: Partial<FoodQueryInput>,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<PaginatedResponseData<FoodDTO>> {
    return this.http.get<PaginatedResponseData<FoodDTO>>(API_ROUTES.FUEL.FOODS, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getFood(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<FoodDTO> {
    return this.http.get<FoodDTO>(API_ROUTES.FUEL.FOOD_BY_ID(id), options);
  }

  public async createFood(
    input: CreateFoodInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<FoodDTO> {
    return this.http.post<FoodDTO>(API_ROUTES.FUEL.FOODS, input, options);
  }

  public async updateFood(
    id: string,
    input: UpdateFoodInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<FoodDTO> {
    return this.http.patch<FoodDTO>(API_ROUTES.FUEL.FOOD_BY_ID(id), input, options);
  }

  public async deleteFood(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<null> {
    return this.http.delete<null>(API_ROUTES.FUEL.FOOD_BY_ID(id), options);
  }

  // --- Meals ---

  public async listMeals(
    query?: Partial<MealQueryInput>,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<PaginatedResponseData<MealDTO>> {
    return this.http.get<PaginatedResponseData<MealDTO>>(API_ROUTES.FUEL.MEALS, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getMeal(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<MealDTO> {
    return this.http.get<MealDTO>(API_ROUTES.FUEL.MEAL_BY_ID(id), options);
  }

  public async createMeal(
    input: CreateMealInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<MealDTO> {
    return this.http.post<MealDTO>(API_ROUTES.FUEL.MEALS, input, options);
  }

  public async updateMeal(
    id: string,
    input: UpdateMealInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<MealDTO> {
    return this.http.patch<MealDTO>(API_ROUTES.FUEL.MEAL_BY_ID(id), input, options);
  }

  public async deleteMeal(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<null> {
    return this.http.delete<null>(API_ROUTES.FUEL.MEAL_BY_ID(id), options);
  }

  // --- Meal Food Entries ---

  public async addMealFoodEntry(
    mealId: string,
    input: AddMealFoodEntryInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<MealDTO> {
    return this.http.post<MealDTO>(
      API_ROUTES.FUEL.MEAL_FOODS(mealId),
      input,
      options
    );
  }

  public async updateMealFoodEntry(
    mealId: string,
    entryId: string,
    input: UpdateMealFoodEntryInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<MealDTO> {
    return this.http.patch<MealDTO>(
      API_ROUTES.FUEL.MEAL_FOOD_BY_ID(mealId, entryId),
      input,
      options
    );
  }

  public async deleteMealFoodEntry(
    mealId: string,
    entryId: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<MealDTO> {
    return this.http.delete<MealDTO>(
      API_ROUTES.FUEL.MEAL_FOOD_BY_ID(mealId, entryId),
      options
    );
  }

  // --- Nutrition Targets ---

  public async getCurrentNutritionTarget(
    date?: string,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<NutritionTargetDTO | null> {
    return this.http.get<NutritionTargetDTO | null>(API_ROUTES.FUEL.TARGET_CURRENT, {
      ...options,
      params: date ? { date } : undefined,
    });
  }

  public async listNutritionTargets(
    query?: Partial<TargetQueryInput>,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<PaginatedResponseData<NutritionTargetDTO>> {
    return this.http.get<PaginatedResponseData<NutritionTargetDTO>>(
      API_ROUTES.FUEL.TARGETS,
      { ...options, params: query as Record<string, unknown> }
    );
  }

  public async createNutritionTarget(
    input: NutritionTargetInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<NutritionTargetDTO> {
    return this.http.post<NutritionTargetDTO>(API_ROUTES.FUEL.TARGETS, input, options);
  }

  public async updateNutritionTarget(
    id: string,
    input: UpdateNutritionTargetInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'body'>
  ): Promise<NutritionTargetDTO> {
    return this.http.patch<NutritionTargetDTO>(
      API_ROUTES.FUEL.TARGET_BY_ID(id),
      input,
      options
    );
  }

  public async deleteNutritionTarget(
    id: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<null> {
    return this.http.delete<null>(API_ROUTES.FUEL.TARGET_BY_ID(id), options);
  }

  // --- Summary & Analytics ---

  public async getFuelSummary(
    date?: string,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<NutritionDailySummaryDTO> {
    return this.http.get<NutritionDailySummaryDTO>(API_ROUTES.FUEL.SUMMARY, {
      ...options,
      params: date ? { date } : undefined,
    });
  }

  public async compareFuelSummary(
    date?: string,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<NutritionTargetComparisonDTO> {
    return this.http.get<NutritionTargetComparisonDTO>(API_ROUTES.FUEL.SUMMARY_COMPARE, {
      ...options,
      params: date ? { date } : undefined,
    });
  }

  public async getFuelHistory(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<NutritionDailySummaryDTO[]> {
    return this.http.get<NutritionDailySummaryDTO[]>(API_ROUTES.FUEL.HISTORY, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }
}
