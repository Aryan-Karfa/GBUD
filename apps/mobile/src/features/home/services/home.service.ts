import { trainService } from '../../train/services/train.service';
import { fuelService } from '../../fuel/services/fuel.service';
import { progressService } from '../../progress/services/progress.service';
import {
  DomainResult,
  TrainingHomeData,
  FuelHomeData,
  ProgressHomeData,
  HomeDashboardState,
} from '../home.types';

export class HomeService {
  /**
   * Fetches the current training state (active workout session and most recent workout).
   */
  public async fetchTrainingDomain(): Promise<DomainResult<TrainingHomeData>> {
    try {
      const [activeWorkout, historyRes] = await Promise.all([
        trainService.getActiveWorkoutSession().catch(() => null),
        trainService.listWorkoutHistory({ page: 1, limit: 1 }).catch(() => null),
      ]);

      const recentWorkout = historyRes?.items?.[0] || null;

      return {
        data: {
          activeWorkout,
          recentWorkout,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.message || 'Unable to load training data',
      };
    }
  }

  /**
   * Fetches today's fuel state (daily summary, target comparison, and logged meals).
   */
  public async fetchFuelDomain(date: string): Promise<DomainResult<FuelHomeData>> {
    try {
      const [summary, comparison, mealsRes] = await Promise.all([
        fuelService.getDailySummary(date).catch(() => null),
        fuelService.compareFuelSummary(date).catch(() => null),
        fuelService.listMeals({ mealDate: date }).catch(() => null),
      ]);

      return {
        data: {
          summary,
          comparison,
          todayMeals: mealsRes?.items || [],
        },
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.message || 'Unable to load nutrition data',
      };
    }
  }

  /**
   * Fetches the high-level progress analytics dashboard snapshot.
   */
  public async fetchProgressDomain(): Promise<DomainResult<ProgressHomeData>> {
    try {
      const dashboard = await progressService.getProgressDashboard();

      return {
        data: {
          dashboard,
        },
        error: null,
      };
    } catch (err: any) {
      return {
        data: null,
        error: err?.message || 'Unable to load progress analytics',
      };
    }
  }

  /**
   * Coordinates concurrent fetching across all three domains with isolated failure boundaries.
   */
  public async fetchDashboard(date: string): Promise<HomeDashboardState> {
    const [training, fuel, progress] = await Promise.all([
      this.fetchTrainingDomain(),
      this.fetchFuelDomain(date),
      this.fetchProgressDomain(),
    ]);

    return {
      training,
      fuel,
      progress,
    };
  }
}

export const homeService = new HomeService();
