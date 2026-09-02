import { apiClient } from '../../../api/client';
import {
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ExercisePerformanceDTO,
  ExerciseTrendPointDTO,
  ProgressDashboardDTO,
  ProgressDateRangeInput,
} from '../progress.types';

export class ProgressService {
  /**
   * Retrieves overall progress training summary for the specified date range.
   */
  public async getProgressSummary(query?: ProgressDateRangeInput): Promise<ProgressSummaryDTO> {
    return apiClient.progress.getProgressSummary(query);
  }

  /**
   * Retrieves workout frequency metrics (total, completed, abandoned, per week).
   */
  public async getTrainingFrequency(query?: ProgressDateRangeInput): Promise<TrainingFrequencyDTO> {
    return apiClient.progress.getTrainingFrequency(query);
  }

  /**
   * Retrieves total volume summary with unit.
   */
  public async getVolumeSummary(query?: ProgressDateRangeInput): Promise<VolumeSummaryDTO> {
    return apiClient.progress.getVolumeSummary(query);
  }

  /**
   * Retrieves volume breakdown by exercise.
   */
  public async getExerciseVolume(query?: ProgressDateRangeInput): Promise<ExerciseVolumeItemDTO[]> {
    return apiClient.progress.getExerciseVolume(query);
  }

  /**
   * Retrieves volume breakdown by anatomical muscle group.
   */
  public async getMuscleVolume(query?: ProgressDateRangeInput): Promise<MuscleGroupVolumeItemDTO[]> {
    return apiClient.progress.getMuscleVolume(query);
  }

  /**
   * Retrieves personal records across exercises.
   */
  public async getPersonalRecords(query?: ProgressDateRangeInput): Promise<PersonalRecordItemDTO[]> {
    return apiClient.progress.getPersonalRecords(query);
  }

  /**
   * Retrieves comprehensive performance statistics for a specific exercise.
   */
  public async getExercisePerformance(exerciseId: string): Promise<ExercisePerformanceDTO> {
    return apiClient.progress.getExercisePerformance(exerciseId);
  }

  /**
   * Retrieves historical progression trend data points for a specific exercise.
   */
  public async getExerciseTrend(exerciseId: string): Promise<ExerciseTrendPointDTO[]> {
    return apiClient.progress.getExerciseTrend(exerciseId);
  }

  /**
   * Retrieves exercises for search and selection in analytics.
   */
  public async listExercises(query?: { search?: string; limit?: number }) {
    return apiClient.train.listExercises(query);
  }

  /**
   * Retrieves high-level progress dashboard data.
   */
  public async getProgressDashboard(): Promise<ProgressDashboardDTO> {
    return apiClient.progress.getProgressDashboard();
  }
}

export const progressService = new ProgressService();
