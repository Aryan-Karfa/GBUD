import { Request, Response, NextFunction } from 'express';
import { workoutTemplateService } from './workout-template.service';
import { APIResponse, WorkoutTemplateDTO } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';

export class WorkoutTemplateController {
  public create = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await workoutTemplateService.createTemplate(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Workout template created successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await workoutTemplateService.getUserTemplates(userId);

      res.status(200).json({
        success: true,
        message: 'User workout templates retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutTemplateService.getTemplateById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Workout template retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutTemplateService.updateTemplate(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Workout template updated successfully',
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
      await workoutTemplateService.deleteTemplate(id, userId);

      res.status(200).json({
        success: true,
        message: 'Workout template deleted successfully',
        data: null,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public addExercise = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutTemplateService.addExerciseToTemplate(id, userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Exercise added to workout template successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public removeExercise = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const templateExerciseId = req.params.templateExerciseId as string;
      const result = await workoutTemplateService.removeExerciseFromTemplate(id, userId, templateExerciseId);

      res.status(200).json({
        success: true,
        message: 'Exercise removed from workout template successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public reorderExercises = async (
    req: Request,
    res: Response<APIResponse<WorkoutTemplateDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutTemplateService.reorderTemplateExercises(id, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Template exercises reordered successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const workoutTemplateController = new WorkoutTemplateController();
