import { Request, Response, NextFunction } from 'express';
import { workoutSessionService } from './workout-session.service';
import { APIResponse, WorkoutSessionDTO, PaginatedResponseData } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { WorkoutSessionQueryInput } from '@gbud/validation';

export class WorkoutSessionController {
  public start = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await workoutSessionService.startWorkout(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Workout session started successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getActive = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const result = await workoutSessionService.getActiveWorkout(userId);

      res.status(200).json({
        success: true,
        message: 'Active workout session retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public listHistory = async (
    req: Request,
    res: Response<APIResponse<PaginatedResponseData<WorkoutSessionDTO>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as WorkoutSessionQueryInput;
      const result = await workoutSessionService.listWorkoutHistory(userId, query);

      res.status(200).json({
        success: true,
        message: 'Workout session history retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutSessionService.getWorkoutSessionById(id, userId);

      res.status(200).json({
        success: true,
        message: 'Workout session retrieved successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public addSet = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId as string;
      const sessionExerciseId = req.params.sessionExerciseId as string;
      const result = await workoutSessionService.addSet(sessionId, userId, sessionExerciseId, req.body);

      res.status(201).json({
        success: true,
        message: 'Set added to workout exercise successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public updateSet = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId as string;
      const sessionExerciseId = req.params.sessionExerciseId as string;
      const setId = req.params.setId as string;
      const result = await workoutSessionService.updateSet(
        sessionId,
        userId,
        sessionExerciseId,
        setId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Workout set updated successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteSet = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId as string;
      const sessionExerciseId = req.params.sessionExerciseId as string;
      const setId = req.params.setId as string;
      const result = await workoutSessionService.deleteSet(sessionId, userId, sessionExerciseId, setId);

      res.status(200).json({
        success: true,
        message: 'Workout set deleted successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public complete = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutSessionService.completeWorkout(id, userId);

      res.status(200).json({
        success: true,
        message: 'Workout session completed successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public abandon = async (
    req: Request,
    res: Response<APIResponse<WorkoutSessionDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const result = await workoutSessionService.abandonWorkout(id, userId);

      res.status(200).json({
        success: true,
        message: 'Workout session abandoned successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const workoutSessionController = new WorkoutSessionController();
