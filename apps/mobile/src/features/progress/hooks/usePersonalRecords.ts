import { useState, useEffect, useCallback } from 'react';
import {
  PersonalRecordItemDTO,
  DateRangePreset,
  getDateRangeForPreset,
  isValidDateRange,
} from '../progress.types';
import { progressService } from '../services/progress.service';

export interface UsePersonalRecordsOptions {
  initialPreset?: DateRangePreset;
  initialFrom?: string;
  initialTo?: string;
}

export function usePersonalRecords(options?: UsePersonalRecordsOptions) {
  const initialPreset = options?.initialPreset ?? '30D';
  const defaultRange = getDateRangeForPreset(initialPreset);

  const [preset, setPresetState] = useState<DateRangePreset>(initialPreset);
  const [from, setFrom] = useState<string>(options?.initialFrom ?? defaultRange.from);
  const [to, setTo] = useState<string>(options?.initialTo ?? defaultRange.to);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecordItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (fromDate?: string, toDate?: string) => {
    if (!isValidDateRange(fromDate, toDate)) {
      setError("Invalid date range: 'from' date must be earlier than or equal to 'to' date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await progressService.getPersonalRecords({ from: fromDate, to: toDate });
      setPersonalRecords(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load personal records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(from, to);
  }, [fetchRecords, from, to]);

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
    return fetchRecords(from, to);
  }, [fetchRecords, from, to]);

  return {
    personalRecords,
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
