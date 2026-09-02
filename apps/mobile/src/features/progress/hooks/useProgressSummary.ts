import { useState, useEffect, useCallback } from 'react';
import {
  ProgressSummaryDTO,
  DateRangePreset,
  getDateRangeForPreset,
  isValidDateRange,
} from '../progress.types';
import { progressService } from '../services/progress.service';

export interface UseProgressSummaryOptions {
  initialPreset?: DateRangePreset;
  initialFrom?: string;
  initialTo?: string;
}

export function useProgressSummary(options?: UseProgressSummaryOptions) {
  const initialPreset = options?.initialPreset ?? '30D';
  const defaultRange = getDateRangeForPreset(initialPreset);

  const [preset, setPresetState] = useState<DateRangePreset>(initialPreset);
  const [from, setFrom] = useState<string>(options?.initialFrom ?? defaultRange.from);
  const [to, setTo] = useState<string>(options?.initialTo ?? defaultRange.to);
  const [summary, setSummary] = useState<ProgressSummaryDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (fromDate?: string, toDate?: string) => {
    if (!isValidDateRange(fromDate, toDate)) {
      setError("Invalid date range: 'from' date must be earlier than or equal to 'to' date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await progressService.getProgressSummary({ from: fromDate, to: toDate });
      setSummary(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load progress summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary(from, to);
  }, [fetchSummary, from, to]);

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
    return fetchSummary(from, to);
  }, [fetchSummary, from, to]);

  return {
    summary,
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
