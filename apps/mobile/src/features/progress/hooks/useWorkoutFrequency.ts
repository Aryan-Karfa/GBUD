import { useState, useEffect, useCallback } from 'react';
import {
  TrainingFrequencyDTO,
  DateRangePreset,
  getDateRangeForPreset,
  isValidDateRange,
} from '../progress.types';
import { progressService } from '../services/progress.service';

export interface UseWorkoutFrequencyOptions {
  initialPreset?: DateRangePreset;
  initialFrom?: string;
  initialTo?: string;
}

export function useWorkoutFrequency(options?: UseWorkoutFrequencyOptions) {
  const initialPreset = options?.initialPreset ?? '30D';
  const defaultRange = getDateRangeForPreset(initialPreset);

  const [preset, setPresetState] = useState<DateRangePreset>(initialPreset);
  const [from, setFrom] = useState<string>(options?.initialFrom ?? defaultRange.from);
  const [to, setTo] = useState<string>(options?.initialTo ?? defaultRange.to);
  const [frequency, setFrequency] = useState<TrainingFrequencyDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFrequency = useCallback(async (fromDate?: string, toDate?: string) => {
    if (!isValidDateRange(fromDate, toDate)) {
      setError("Invalid date range: 'from' date must be earlier than or equal to 'to' date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await progressService.getTrainingFrequency({ from: fromDate, to: toDate });
      setFrequency(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load workout frequency.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrequency(from, to);
  }, [fetchFrequency, from, to]);

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
    return fetchFrequency(from, to);
  }, [fetchFrequency, from, to]);

  return {
    frequency,
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
