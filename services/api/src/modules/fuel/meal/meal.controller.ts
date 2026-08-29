import { Request, Response, NextFunction } from 'express';
import { mealService } from './meal.service';
import {
  APIResponse,
  MealDTO,
  NutritionDailySummaryDTO,
  NutritionTargetComparisonDTO,
  PaginatedResponseData,
} from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { ProgressDateRangeInput } from '@gbud/validation';

export class MealController {
  public create = async (
    req: Request,
    res: Response<APIResponse<MealDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await mealService.createMeal(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Meal created successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (
    req: Request,
    res: Response<APIResponse<PaginatedResponseData<MealDTO>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query as { page?: number; limit?: number; mealDate?: string };
      const result = await mealService.listMeals(userId, query);

      res.status(200).json({
        success: true,
        message: 'Meals retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response<APIResponse<MealDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await mealService.getMealById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Meal details retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response<APIResponse<MealDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await mealService.updateMeal(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Meal updated successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (
    req: Request,
    res: Response<APIResponse<null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      await mealService.deleteMeal(id, userId);

      res.status(200).json({
        success: true,
        message: 'Meal deleted successfully',
        data: null,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public addFoodEntry = async (
    req: Request,
    res: Response<APIResponse<MealDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const mealId = req.params.mealId as string;
      const result = await mealService.addFoodEntry(mealId, userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Food item added to meal successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public updateFoodEntry = async (
    req: Request,
    res: Response<APIResponse<MealDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const mealId = req.params.mealId as string;
      const entryId = req.params.entryId as string;
      const result = await mealService.updateFoodEntry(mealId, userId, entryId, req.body);

      res.status(200).json({
        success: true,
        message: 'Meal food entry updated successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteFoodEntry = async (
    req: Request,
    res: Response<APIResponse<MealDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const mealId = req.params.mealId as string;
      const entryId = req.params.entryId as string;
      const result = await mealService.deleteFoodEntry(mealId, userId, entryId);

      res.status(200).json({
        success: true,
        message: 'Meal food entry deleted successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getSummary = async (
    req: Request,
    res: Response<APIResponse<NutritionDailySummaryDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const result = await mealService.getDailySummary(userId, dateStr);

      res.status(200).json({
        success: true,
        message: 'Daily nutrition summary retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getSummaryCompare = async (
    req: Request,
    res: Response<APIResponse<NutritionTargetComparisonDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const result = await mealService.getSummaryComparison(userId, dateStr);

      res.status(200).json({
        success: true,
        message: 'Daily nutrition target comparison retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (
    req: Request,
    res: Response<APIResponse<NutritionDailySummaryDTO[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as ProgressDateRangeInput;
      const result = await mealService.getNutritionHistory(userId, query);

      res.status(200).json({
        success: true,
        message: 'Nutrition history retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const mealController = new MealController();
