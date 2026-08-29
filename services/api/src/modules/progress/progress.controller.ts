import { Request, Response, NextFunction } from 'express';
import { progressService } from './progress.service';
import {
  APIResponse,
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ExercisePerformanceDTO,
  ExerciseTrendPointDTO,
  ProgressDashboardDTO,
} from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { ProgressDateRangeInput } from '@gbud/validation';

export class ProgressController {
  public getSummary = async (
    req: Request,
    res: Response<APIResponse<ProgressSummaryDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateRange = req.query as unknown as ProgressDateRangeInput;
      const data = await progressService.getSummary(userId, dateRange);

      res.status(200).json({
        success: true,
        message: 'Progress summary retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getFrequency = async (
    req: Request,
    res: Response<APIResponse<TrainingFrequencyDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateRange = req.query as unknown as ProgressDateRangeInput;
      const data = await progressService.getFrequency(userId, dateRange);

      res.status(200).json({
        success: true,
        message: 'Training frequency retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getVolume = async (
    req: Request,
    res: Response<APIResponse<VolumeSummaryDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateRange = req.query as unknown as ProgressDateRangeInput;
      const data = await progressService.getTotalVolume(userId, dateRange);

      res.status(200).json({
        success: true,
        message: 'Total training volume retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getVolumeByExercise = async (
    req: Request,
    res: Response<APIResponse<ExerciseVolumeItemDTO[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateRange = req.query as unknown as ProgressDateRangeInput;
      const data = await progressService.getVolumeByExercise(userId, dateRange);

      res.status(200).json({
        success: true,
        message: 'Volume by exercise retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getVolumeByMuscleGroup = async (
    req: Request,
    res: Response<APIResponse<MuscleGroupVolumeItemDTO[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateRange = req.query as unknown as ProgressDateRangeInput;
      const data = await progressService.getVolumeByMuscleGroup(userId, dateRange);

      res.status(200).json({
        success: true,
        message: 'Volume by muscle group retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getPRs = async (
    req: Request,
    res: Response<APIResponse<PersonalRecordItemDTO[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dateRange = req.query as unknown as ProgressDateRangeInput;
      const data = await progressService.getPersonalRecords(userId, dateRange);

      res.status(200).json({
        success: true,
        message: 'GBUD-derived personal records retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getExercisePerformance = async (
    req: Request,
    res: Response<APIResponse<ExercisePerformanceDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const exerciseId = req.params.exerciseId as string;
      const data = await progressService.getExercisePerformance(userId, exerciseId);

      res.status(200).json({
        success: true,
        message: 'Exercise performance history retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getExerciseTrend = async (
    req: Request,
    res: Response<APIResponse<ExerciseTrendPointDTO[]>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const exerciseId = req.params.exerciseId as string;
      const data = await progressService.getExerciseTrend(userId, exerciseId);

      res.status(200).json({
        success: true,
        message: 'Exercise strength trend retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public getDashboard = async (
    req: Request,
    res: Response<APIResponse<ProgressDashboardDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const data = await progressService.getDashboard(userId);

      res.status(200).json({
        success: true,
        message: 'Progress dashboard snapshot retrieved successfully',
        data,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const progressController = new ProgressController();
