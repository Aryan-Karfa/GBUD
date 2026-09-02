import { useState, useEffect, useCallback } from 'react';
import {
  VolumeSummaryDTO,
  ExerciseVolumeItemDTO,
  MuscleGroupVolumeItemDTO,
  DateRangePreset,
  getDateRangeForPreset,
  isValidDateRange,
} from '../progress.types';
import { progressService } from '../services/progress.service';

export interface UseTrainingVolumeOptions {
  initialPreset?: DateRangePreset;
  initialFrom?: string;
  initialTo?: string;
}

export function useTrainingVolume(options?: UseTrainingVolumeOptions) {
  const initialPreset = options?.initialPreset ?? '30D';
  const defaultRange = getDateRangeForPreset(initialPreset);

  const [preset, setPresetState] = useState<DateRangePreset>(initialPreset);
  const [from, setFrom] = useState<string>(options?.initialFrom ?? defaultRange.from);
  const [to, setTo] = useState<string>(options?.initialTo ?? defaultRange.to);

  const [volumeSummary, setVolumeSummary] = useState<VolumeSummaryDTO | null>(null);
  const [exerciseVolume, setExerciseVolume] = useState<ExerciseVolumeItemDTO[]>([]);
  const [muscleVolume, setMuscleVolume] = useState<MuscleGroupVolumeItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVolumeData = useCallback(async (fromDate?: string, toDate?: string) => {
    if (!isValidDateRange(fromDate, toDate)) {
      setError("Invalid date range: 'from' date must be earlier than or equal to 'to' date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [summaryRes, exercisesRes, musclesRes] = await Promise.all([
        progressService.getVolumeSummary({ from: fromDate, to: toDate }),
        progressService.getExerciseVolume({ from: fromDate, to: toDate }),
        progressService.getMuscleVolume({ from: fromDate, to: toDate }),
      ]);
      setVolumeSummary(summaryRes);
      setExerciseVolume(exercisesRes);
      setMuscleVolume(musclesRes);
    } catch (err: any) {
      setError(err?.message || 'Failed to load training volume data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVolumeData(from, to);
  }, [fetchVolumeData, from, to]);

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setPresetState(newPreset);
    if (newPreset !== 'CUSTOM') {
      const range = getDateRangeForPreset(newPreset);
      setFrom(range.from);
      setTo(range.to);
    }
  }, []);

  const setDateRange = useCallback((newFrom: string, newTo: string) => {
    setPresetState('CUSTOM');
    setFrom(newFrom);
    setTo(newTo);
  }, []);

  const refresh = useCallback(() => {
    return fetchVolumeData(from, to);
  }, [fetchVolumeData, from, to]);

  return {
    volumeSummary,
    exerciseVolume,
    muscleVolume,
    loading,
    error,
    preset,
    from,
    to,
    setPreset,
    setDateRange,
    refresh,
  };
}
