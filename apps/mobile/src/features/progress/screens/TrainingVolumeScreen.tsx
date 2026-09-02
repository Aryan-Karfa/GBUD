import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen, Text, Card, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useTrainingVolume } from '../hooks/useTrainingVolume';
import {
  DateRangeSelector,
  VolumeSummaryCard,
  VolumeTrendChart,
  ExerciseVolumeRow,
  MuscleVolumeRow,
  ProgressSectionHeader,
  ProgressErrorState,
} from '../components';

export const TrainingVolumeScreen: React.FC = () => {
  const { navigateProgress, progressParams } = useNavigation();
  const {
    volumeSummary,
    exerciseVolume,
    muscleVolume,
    loading,
    error,
    preset,
    from,
    to,
    setPreset,
    refresh,
  } = useTrainingVolume({
    initialFrom: progressParams?.from,
    initialTo: progressParams?.to,
    initialPreset: '30D',
  });

  const maxExerciseVol = exerciseVolume.length > 0 ? Math.max(...exerciseVolume.map((e) => e.totalVolume)) : 1;
  const maxMuscleVol = muscleVolume.length > 0 ? Math.max(...muscleVolume.map((m) => m.totalVolume)) : 1;

  // Time-series volume trend data points constructed from top volume items
  const chartData = exerciseVolume.slice(0, 7).map((e) => ({
    label: e.exerciseName.slice(0, 6),
    volume: e.totalVolume,
  }));

  return (
    <Screen padding="md" testID="training-volume-screen">
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
            Training Volume
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Total workload and tonnage lifted
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

        {loading && !volumeSummary ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : (
          <>
            <VolumeSummaryCard volumeSummary={volumeSummary} style={styles.card} />

            {chartData.length > 0 && (
              <VolumeTrendChart data={chartData} title="Top Volume Drivers" style={styles.card} />
            )}

            {/* Top Exercises Preview */}
            <View style={styles.section}>
              <ProgressSectionHeader
                title="Top Exercises"
                actionLabel="View All →"
                onActionPress={() => navigateProgress('ExerciseVolume', { from, to })}
              />
              <Card elevation="elevation2" style={styles.listCard}>
                {exerciseVolume.length === 0 ? (
                  <Text variant="body" color={theme.colors.text.muted} align="center">
                    No exercise volume recorded for this period.
                  </Text>
                ) : (
                  exerciseVolume.slice(0, 5).map((item, idx) => (
                    <ExerciseVolumeRow
                      key={`${item.exerciseId}-${idx}`}
                      item={item}
                      maxVolume={maxExerciseVol}
                      onPress={() =>
                        item.exerciseId
                          ? navigateProgress('ExercisePerformance', {
                              exerciseId: item.exerciseId,
                              exerciseName: item.exerciseName,
                            })
                          : undefined
                      }
                    />
                  ))
                )}
              </Card>
            </View>

            {/* Muscle Breakdown Preview */}
            <View style={styles.section}>
              <ProgressSectionHeader
                title="Muscle Group Breakdown"
                actionLabel="View All →"
                onActionPress={() => navigateProgress('MuscleVolume', { from, to })}
              />
              <Card elevation="elevation2" style={styles.listCard}>
                {muscleVolume.length === 0 ? (
                  <Text variant="body" color={theme.colors.text.muted} align="center">
                    No muscle volume recorded for this period.
                  </Text>
                ) : (
                  muscleVolume.slice(0, 5).map((item, idx) => (
                    <MuscleVolumeRow
                      key={`${item.muscleGroup}-${idx}`}
                      item={item}
                      maxVolume={maxMuscleVol}
                    />
                  ))
                )}
              </Card>
            </View>
          </>
        )}
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
  section: {
    marginBottom: theme.spacing.lg,
  },
  listCard: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
});
