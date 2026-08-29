import { Request, Response, NextFunction } from 'express';
import { foodService } from './food.service';
import { APIResponse, FoodDTO, PaginatedResponseData } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { FoodQueryInput } from '@gbud/validation';

export class FoodController {
  public list = async (
    req: Request,
    res: Response<APIResponse<PaginatedResponseData<FoodDTO>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as FoodQueryInput;
      const result = await foodService.listFoods(userId, query);

      res.status(200).json({
        success: true,
        message: 'Food items retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response<APIResponse<FoodDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await foodService.getFoodById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Food item retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (
    req: Request,
    res: Response<APIResponse<FoodDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await foodService.createCustomFood(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Custom food item created successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response<APIResponse<FoodDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await foodService.updateCustomFood(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Custom food item updated successfully',
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
      await foodService.deleteCustomFood(id, userId);

      res.status(200).json({
        success: true,
        message: 'Custom food item deleted successfully',
        data: null,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const foodController = new FoodController();
