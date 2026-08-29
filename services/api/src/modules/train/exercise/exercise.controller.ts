import { Request, Response, NextFunction } from 'express';
import { exerciseService } from './exercise.service';
import { APIResponse, ExerciseDTO, PaginatedResponseData } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { ExerciseQueryInput } from '@gbud/validation';

export class ExerciseController {
  public list = async (
    req: Request,
    res: Response<APIResponse<PaginatedResponseData<ExerciseDTO>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as unknown as ExerciseQueryInput;
      const result = await exerciseService.listExercises(query);

      res.status(200).json({
        success: true,
        message: 'Exercises retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response<APIResponse<ExerciseDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const exercise = await exerciseService.getExerciseById(id);

      res.status(200).json({
        success: true,
        message: 'Exercise details retrieved successfully',
        data: exercise,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const exerciseController = new ExerciseController();
