import { useState, useEffect, useCallback } from 'react';
import { ProgressDashboardDTO } from '../progress.types';
import { progressService } from '../services/progress.service';

export function useProgressDashboard() {
  const [dashboard, setDashboard] = useState<ProgressDashboardDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await progressService.getProgressDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load progress dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  };
}
