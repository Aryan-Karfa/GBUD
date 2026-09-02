import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen, Text, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useProgressSummary } from '../hooks/useProgressSummary';
import {
  DateRangeSelector,
  ProgressSummaryCard,
  ProgressMetricCard,
  ProgressSectionHeader,
  ProgressErrorState,
} from '../components';

function formatDurationSeconds(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export const ProgressSummaryScreen: React.FC = () => {
  const { progressParams } = useNavigation();
  const { summary, loading, error, preset, from, to, setPreset, refresh } = useProgressSummary({
    initialFrom: progressParams?.from,
    initialTo: progressParams?.to,
    initialPreset: '30D',
  });

  return (
    <Screen padding="md" testID="progress-summary-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={theme.colors.brand.emerald}
            colors={[theme.colors.brand.emerald]}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
            Training Summary
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Aggregate workout and volume progression
          </Text>
        </View>

        <DateRangeSelector
          selectedPreset={preset}
          onPresetChange={setPreset}
          from={from}
          to={to}
          style={styles.dateSelector}
        />

        {error && <ProgressErrorState error={error} onRetry={refresh} />}

        {loading && !summary ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : summary ? (
          <>
            <ProgressSummaryCard summary={summary} style={styles.summaryCard} />

            <ProgressSectionHeader title="Detailed Statistics" />
            <View style={styles.metricGrid}>
              <ProgressMetricCard
                label="Completed Workouts"
                value={summary.completedWorkouts}
                accentColor={theme.colors.status.success}
              />
              <ProgressMetricCard
                label="Training Days"
                value={summary.trainingDays}
                accentColor={theme.colors.brand.emerald}
              />
              <ProgressMetricCard
                label="Total Volume"
                value={summary.totalVolume}
                unit="kg"
                accentColor={theme.colors.brand.emerald}
              />
              <ProgressMetricCard
                label="Total Sets"
                value={summary.totalSets}
                accentColor={theme.colors.brand.cyan}
              />
              <ProgressMetricCard
                label="Total Reps"
                value={summary.totalReps}
                accentColor={theme.colors.brand.cyan}
              />
              <ProgressMetricCard
                label="Avg. Duration"
                value={formatDurationSeconds(summary.averageWorkoutDurationSeconds)}
                accentColor={theme.colors.text.muted}
              />
            </View>

            {summary.abandonedWorkouts > 0 && (
              <View style={styles.noticeContainer}>
                <Text variant="caption" color={theme.colors.text.muted} align="center">
                  Note: {summary.abandonedWorkouts} workout{summary.abandonedWorkouts > 1 ? 's were' : ' was'} abandoned during this period.
                </Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs / 2,
  },
  dateSelector: {
    marginBottom: theme.spacing.lg,
  },
  loaderContainer: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  noticeContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
  },
});
