import { ProgressDateRangeInput } from '@gbud/validation';
import {
  ProgressSummaryDTO,
  TrainingFrequencyDTO,
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  PersonalRecordItemDTO,
  ExerciseTrendPointDTO,
  ExercisePerformanceDTO,
  ProgressDashboardDTO,
  WorkoutSessionDTO,
  WorkoutSessionExerciseDTO,
  WorkoutSetDTO,
} from '@gbud/types';
import { progressRepository, ProgressSessionPayload } from '../../repositories/progress.repository';
import {
  calculateEstimated1RM,
  calculateSetVolume,
  calculateWorkoutDurationSeconds,
} from './progress.calculator';

export class ProgressService {
  private mapSessionToDTO(session: ProgressSessionPayload): WorkoutSessionDTO {
    return {
      id: session.id,
      userId: session.userId,
      workoutTemplateId: session.workoutTemplateId,
      status: session.status as 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED',
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt ? session.completedAt.toISOString() : null,
      abandonedAt: session.abandonedAt ? session.abandonedAt.toISOString() : null,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      sessionExercises: session.sessionExercises.map((se): WorkoutSessionExerciseDTO => ({
        id: se.id,
        workoutSessionId: se.workoutSessionId,
        exerciseId: se.exerciseId,
        name: se.name,
        order: se.order,
        notes: se.notes,
        createdAt: se.createdAt.toISOString(),
        updatedAt: se.updatedAt.toISOString(),
        sets: se.sets.map((s): WorkoutSetDTO => ({
          id: s.id,
          workoutSessionExerciseId: s.workoutSessionExerciseId,
          setNumber: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
      })),
    };
  }

  public async getSummary(userId: string, dateRange?: ProgressDateRangeInput): Promise<ProgressSummaryDTO> {
    const allSessions = await progressRepository.getAllSessions(userId, dateRange);
    const completedSessions = allSessions.filter((s) => s.status === 'COMPLETED');
    const abandonedSessions = allSessions.filter((s) => s.status === 'ABANDONED');

    const uniqueDays = new Set(allSessions.map((s) => s.startedAt.toISOString().split('T')[0]));

    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let totalDurationSeconds = 0;

    for (const session of completedSessions) {
      const duration = calculateWorkoutDurationSeconds(session.startedAt, session.completedAt);
      totalDurationSeconds += duration;

      for (const se of session.sessionExercises) {
        totalSets += se.sets.length;
        for (const set of se.sets) {
          if (set.reps && set.reps > 0) {
            totalReps += set.reps;
          }
          totalVolume += calculateSetVolume(set.weight, set.reps);
        }
      }
    }

    const averageDuration = completedSessions.length > 0
      ? Math.round(totalDurationSeconds / completedSessions.length)
      : 0;

    return {
      totalWorkouts: allSessions.length,
      completedWorkouts: completedSessions.length,
      abandonedWorkouts: abandonedSessions.length,
      trainingDays: uniqueDays.size,
      totalSets,
      totalReps,
      totalVolume: Math.round(totalVolume * 100) / 100,
      averageWorkoutDurationSeconds: averageDuration,
    };
  }

  public async getFrequency(userId: string, dateRange?: ProgressDateRangeInput): Promise<TrainingFrequencyDTO> {
    const allSessions = await progressRepository.getAllSessions(userId, dateRange);
    const completedSessions = allSessions.filter((s) => s.status === 'COMPLETED');
    const abandonedSessions = allSessions.filter((s) => s.status === 'ABANDONED');

    const uniqueDays = new Set(allSessions.map((s) => s.startedAt.toISOString().split('T')[0]));

    let daysPeriod = 30; // Default period fallback
    if (dateRange?.from && dateRange?.to) {
      const fromMs = new Date(dateRange.from).getTime();
      const toMs = new Date(dateRange.to).getTime();
      daysPeriod = Math.max(1, Math.ceil((toMs - fromMs) / (1000 * 60 * 60 * 24)));
    } else if (allSessions.length > 0) {
      const earliest = allSessions[0].startedAt.getTime();
      const latest = allSessions[allSessions.length - 1].startedAt.getTime();
      daysPeriod = Math.max(1, Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24))) || 1;
    }

    const weeks = Math.max(1, daysPeriod / 7);
    const workoutsPerWeek = Math.round((completedSessions.length / weeks) * 10) / 10;

    return {
      totalWorkouts: allSessions.length,
      completedWorkouts: completedSessions.length,
      abandonedWorkouts: abandonedSessions.length,
      trainingDays: uniqueDays.size,
      workoutsPerWeek,
    };
  }

  public async getTotalVolume(userId: string, dateRange?: ProgressDateRangeInput): Promise<VolumeSummaryDTO> {
    const completedSessions = await progressRepository.getCompletedSessions(userId, dateRange);

    let totalVolume = 0;
    for (const session of completedSessions) {
      for (const se of session.sessionExercises) {
        for (const set of se.sets) {
          totalVolume += calculateSetVolume(set.weight, set.reps);
        }
      }
    }

    return {
      totalVolume: Math.round(totalVolume * 100) / 100,
      unit: 'kg',
    };
  }

  public async getVolumeByExercise(userId: string, dateRange?: ProgressDateRangeInput): Promise<ExerciseVolumeItemDTO[]> {
    const completedSessions = await progressRepository.getCompletedSessions(userId, dateRange);

    const exerciseMap = new Map<string, { exerciseId: string | null; exerciseName: string; totalVolume: number }>();

    for (const session of completedSessions) {
      for (const se of session.sessionExercises) {
        const key = se.name.toLowerCase();
        let volumeSum = 0;
        for (const set of se.sets) {
          volumeSum += calculateSetVolume(set.weight, set.reps);
        }

        if (exerciseMap.has(key)) {
          const current = exerciseMap.get(key)!;
          current.totalVolume += volumeSum;
        } else {
          exerciseMap.set(key, {
            exerciseId: se.exerciseId,
            exerciseName: se.name,
            totalVolume: volumeSum,
          });
        }
      }
    }

    const result = Array.from(exerciseMap.values())
      .map((item) => ({ ...item, totalVolume: Math.round(item.totalVolume * 100) / 100 }))
      .filter((item) => item.totalVolume > 0)
      .sort((a, b) => b.totalVolume - a.totalVolume);

    return result;
  }

  public async getVolumeByMuscleGroup(userId: string, dateRange?: ProgressDateRangeInput): Promise<MuscleGroupVolumeItemDTO[]> {
    const completedSessions = await progressRepository.getCompletedSessions(userId, dateRange);

    const muscleMap = new Map<string, number>();

    for (const session of completedSessions) {
      for (const se of session.sessionExercises) {
        const groupName = (se.exercise?.muscleGroup || 'UNKNOWN').toUpperCase();
        let volumeSum = 0;
        for (const set of se.sets) {
          volumeSum += calculateSetVolume(set.weight, set.reps);
        }

        if (volumeSum > 0) {
          muscleMap.set(groupName, (muscleMap.get(groupName) || 0) + volumeSum);
        }
      }
    }

    return Array.from(muscleMap.entries())
      .map(([muscleGroup, totalVolume]) => ({
        muscleGroup,
        totalVolume: Math.round(totalVolume * 100) / 100,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);
  }

  public async getPersonalRecords(userId: string, dateRange?: ProgressDateRangeInput): Promise<PersonalRecordItemDTO[]> {
    const completedSessions = await progressRepository.getCompletedSessions(userId, dateRange);

    const prMap = new Map<string, PersonalRecordItemDTO>();

    for (const session of completedSessions) {
      for (const se of session.sessionExercises) {
        const key = se.name.toLowerCase();

        if (!prMap.has(key)) {
          prMap.set(key, {
            exerciseId: se.exerciseId,
            exerciseName: se.name,
            maxWeight: null,
            maxReps: null,
            maxVolume: null,
            estimated1RM: null,
            achievedAt: null,
            sessionId: null,
            sessionExerciseId: null,
          });
        }

        const pr = prMap.get(key)!;

        for (const set of se.sets) {
          // Weight PR
          if (set.weight !== null && set.weight > 0) {
            if (pr.maxWeight === null || set.weight >= pr.maxWeight) {
              pr.maxWeight = set.weight;
              pr.achievedAt = session.startedAt.toISOString();
              pr.sessionId = session.id;
              pr.sessionExerciseId = se.id;
            }
          }

          // Rep PR
          if (set.reps !== null && set.reps > 0) {
            if (pr.maxReps === null || set.reps >= pr.maxReps) {
              pr.maxReps = set.reps;
            }
          }

          // Set Volume PR
          const vol = calculateSetVolume(set.weight, set.reps);
          if (vol > 0) {
            if (pr.maxVolume === null || vol >= pr.maxVolume) {
              pr.maxVolume = vol;
            }
          }

          // Estimated 1RM PR
          const est1RM = calculateEstimated1RM(set.weight, set.reps);
          if (est1RM !== null) {
            if (pr.estimated1RM === null || est1RM >= pr.estimated1RM) {
              pr.estimated1RM = est1RM;
            }
          }
        }
      }
    }

    return Array.from(prMap.values()).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
  }

  public async getExercisePerformance(userId: string, exerciseId: string): Promise<ExercisePerformanceDTO> {
    const { exerciseName, catalogExercise, sessions } = await progressRepository.getExerciseSessionHistory(
      userId,
      exerciseId
    );

    let setsCount = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let maxWeight: number | null = null;
    let maxReps: number | null = null;
    let estimated1RM: number | null = null;

    for (const s of sessions) {
      for (const se of s.sessionExercises) {
        if (se.exerciseId === exerciseId || se.name.toLowerCase() === exerciseName.toLowerCase()) {
          setsCount += se.sets.length;
          for (const set of se.sets) {
            if (set.reps && set.reps > 0) totalReps += set.reps;
            const vol = calculateSetVolume(set.weight, set.reps);
            totalVolume += vol;

            if (set.weight !== null && set.weight > 0 && (maxWeight === null || set.weight >= maxWeight)) {
              maxWeight = set.weight;
            }
            if (set.reps !== null && set.reps > 0 && (maxReps === null || set.reps >= maxReps)) {
              maxReps = set.reps;
            }

            const est1RM = calculateEstimated1RM(set.weight, set.reps);
            if (est1RM !== null && (estimated1RM === null || est1RM >= estimated1RM)) {
              estimated1RM = est1RM;
            }
          }
        }
      }
    }

    const recentDTOs = sessions
      .slice(-5)
      .reverse()
      .map((s) => this.mapSessionToDTO(s));

    return {
      exercise: {
        id: catalogExercise ? catalogExercise.id : exerciseId,
        name: exerciseName,
      },
      summary: {
        sessions: sessions.length,
        sets: setsCount,
        totalReps,
        totalVolume: Math.round(totalVolume * 100) / 100,
        maxWeight,
        maxReps,
        estimated1RM,
      },
      recent: recentDTOs,
    };
  }

  public async getExerciseTrend(userId: string, exerciseId: string): Promise<ExerciseTrendPointDTO[]> {
    const { exerciseName, sessions } = await progressRepository.getExerciseSessionHistory(
      userId,
      exerciseId
    );

    const trendPoints: ExerciseTrendPointDTO[] = [];

    for (const session of sessions) {
      let dayBestWeight: number | null = null;
      let dayBestReps: number | null = null;
      let dayBest1RM: number | null = null;

      for (const se of session.sessionExercises) {
        if (se.exerciseId === exerciseId || se.name.toLowerCase() === exerciseName.toLowerCase()) {
          for (const set of se.sets) {
            if (set.weight !== null && set.weight > 0 && (dayBestWeight === null || set.weight > dayBestWeight)) {
              dayBestWeight = set.weight;
            }
            if (set.reps !== null && set.reps > 0 && (dayBestReps === null || set.reps > dayBestReps)) {
              dayBestReps = set.reps;
            }
            const est = calculateEstimated1RM(set.weight, set.reps);
            if (est !== null && (dayBest1RM === null || est > dayBest1RM)) {
              dayBest1RM = est;
            }
          }
        }
      }

      if (dayBestWeight !== null || dayBestReps !== null || dayBest1RM !== null) {
        trendPoints.push({
          date: session.startedAt.toISOString().split('T')[0],
          bestWeight: dayBestWeight,
          bestReps: dayBestReps,
          estimated1RM: dayBest1RM,
        });
      }
    }

    return trendPoints.sort((a, b) => a.date.localeCompare(b.date));
  }

  public async getDashboard(userId: string): Promise<ProgressDashboardDTO> {
    const [summary, frequency, totalVolume, topExercises, prs, allSessions] = await Promise.all([
      this.getSummary(userId),
      this.getFrequency(userId),
      this.getTotalVolume(userId),
      this.getVolumeByExercise(userId),
      this.getPersonalRecords(userId),
      progressRepository.getAllSessions(userId),
    ]);

    const recentWorkouts = allSessions
      .filter((s) => s.status === 'COMPLETED')
      .slice(-5)
      .reverse()
      .map((s) => this.mapSessionToDTO(s));

    return {
      summary,
      frequency,
      totalVolume,
      topExercisesByVolume: topExercises.slice(0, 5),
      recentWorkouts,
      prHighlights: prs.slice(0, 5),
    };
  }
}

export const progressService = new ProgressService();
