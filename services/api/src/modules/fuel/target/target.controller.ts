import { Request, Response, NextFunction } from 'express';
import { targetService } from './target.service';
import { APIResponse, NutritionTargetDTO, PaginatedResponseData } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';

export class TargetController {
  public create = async (
    req: Request,
    res: Response<APIResponse<NutritionTargetDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await targetService.createTarget(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Nutrition target created successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getCurrent = async (
    req: Request,
    res: Response<APIResponse<NutritionTargetDTO | null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateStr = req.query.date as string | undefined;
      const result = await targetService.getCurrentTarget(userId, dateStr);

      res.status(200).json({
        success: true,
        message: 'Current nutrition target retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (
    req: Request,
    res: Response<APIResponse<PaginatedResponseData<NutritionTargetDTO>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query as { page?: number; limit?: number };
      const result = await targetService.listTargets(userId, query);

      res.status(200).json({
        success: true,
        message: 'Nutrition targets retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response<APIResponse<NutritionTargetDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await targetService.updateTarget(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Nutrition target updated successfully',
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
      await targetService.deleteTarget(id, userId);

      res.status(200).json({
        success: true,
        message: 'Nutrition target deleted successfully',
        data: null,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const targetController = new TargetController();
