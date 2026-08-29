import { API_ROUTES } from '@gbud/constants';
import {
  ExercisePerformanceDTO,
  ExerciseTrendPointDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ProgressDashboardDTO,
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
} from '@gbud/types';
import { ProgressDateRangeInput } from '@gbud/validation';
import { HttpClient } from '../client/http-client';
import { RequestOptions } from '../client/request';

export class ProgressEndpointClient {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  public async getProgressSummary(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<ProgressSummaryDTO> {
    return this.http.get<ProgressSummaryDTO>(API_ROUTES.PROGRESS.SUMMARY, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getTrainingFrequency(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<TrainingFrequencyDTO> {
    return this.http.get<TrainingFrequencyDTO>(API_ROUTES.PROGRESS.FREQUENCY, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getVolumeSummary(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<VolumeSummaryDTO> {
    return this.http.get<VolumeSummaryDTO>(API_ROUTES.PROGRESS.VOLUME, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getExerciseVolume(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<ExerciseVolumeItemDTO[]> {
    return this.http.get<ExerciseVolumeItemDTO[]>(API_ROUTES.PROGRESS.VOLUME_EXERCISES, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getMuscleVolume(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<MuscleGroupVolumeItemDTO[]> {
    return this.http.get<MuscleGroupVolumeItemDTO[]>(API_ROUTES.PROGRESS.VOLUME_MUSCLES, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getPersonalRecords(
    query?: ProgressDateRangeInput,
    options?: Omit<RequestOptions, 'method' | 'path' | 'params'>
  ): Promise<PersonalRecordItemDTO[]> {
    return this.http.get<PersonalRecordItemDTO[]>(API_ROUTES.PROGRESS.PRS, {
      ...options,
      params: query as Record<string, unknown>,
    });
  }

  public async getExercisePerformance(
    exerciseId: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<ExercisePerformanceDTO> {
    return this.http.get<ExercisePerformanceDTO>(
      API_ROUTES.PROGRESS.EXERCISE_PERFORMANCE(exerciseId),
      options
    );
  }

  public async getExerciseTrend(
    exerciseId: string,
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<ExerciseTrendPointDTO[]> {
    return this.http.get<ExerciseTrendPointDTO[]>(
      API_ROUTES.PROGRESS.EXERCISE_TREND(exerciseId),
      options
    );
  }

  public async getProgressDashboard(
    options?: Omit<RequestOptions, 'method' | 'path'>
  ): Promise<ProgressDashboardDTO> {
    return this.http.get<ProgressDashboardDTO>(API_ROUTES.PROGRESS.DASHBOARD, options);
  }
}
