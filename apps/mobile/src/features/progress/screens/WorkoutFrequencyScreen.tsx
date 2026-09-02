import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen, Text, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutFrequency } from '../hooks/useWorkoutFrequency';
import {
  DateRangeSelector,
  WorkoutFrequencyCard,
  FrequencyTrendChart,
  ProgressMetricCard,
  ProgressSectionHeader,
  ProgressErrorState,
} from '../components';

export const WorkoutFrequencyScreen: React.FC = () => {
  const { progressParams } = useNavigation();
  const { frequency, loading, error, preset, from, to, setPreset, refresh } = useWorkoutFrequency({
    initialFrom: progressParams?.from,
    initialTo: progressParams?.to,
    initialPreset: '30D',
  });

  return (
    <Screen padding="md" testID="workout-frequency-screen">
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
            Workout Frequency
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Consistency and weekly training volume pace
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

        {loading && !frequency ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : frequency ? (
          <>
            <WorkoutFrequencyCard frequency={frequency} style={styles.card} />

            <FrequencyTrendChart
              workoutsPerWeek={frequency.workoutsPerWeek}
              completedWorkouts={frequency.completedWorkouts}
              trainingDays={frequency.trainingDays}
              totalWorkouts={frequency.totalWorkouts}
              style={styles.card}
            />

            <ProgressSectionHeader title="Frequency Breakdown" />
            <View style={styles.metricGrid}>
              <ProgressMetricCard
                label="Weekly Average"
                value={frequency.workoutsPerWeek}
                unit="workouts/wk"
                accentColor={theme.colors.brand.emerald}
              />
              <ProgressMetricCard
                label="Completed Workouts"
                value={frequency.completedWorkouts}
                accentColor={theme.colors.status.success}
              />
              <ProgressMetricCard
                label="Active Days"
                value={frequency.trainingDays}
                accentColor={theme.colors.brand.cyan}
              />
              <ProgressMetricCard
                label="Total Sessions"
                value={frequency.totalWorkouts}
                subtext={
                  frequency.abandonedWorkouts > 0
                    ? `${frequency.abandonedWorkouts} abandoned`
                    : 'All completed'
                }
                accentColor={theme.colors.text.muted}
              />
            </View>
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
  card: {
    marginBottom: theme.spacing.lg,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
