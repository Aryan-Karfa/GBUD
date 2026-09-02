import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen, Text, Card, LoadingIndicator } from '../../../components';
import { theme } from '../../../theme/theme';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useProgressDashboard } from '../hooks/useProgressDashboard';
import { useProgressSummary } from '../hooks/useProgressSummary';
import {
  DateRangeSelector,
  ProgressSummaryCard,
  VolumeSummaryCard,
  PersonalRecordCard,
  ProgressSectionHeader,
  ProgressErrorState,
} from '../components';

export const ProgressHomeScreen: React.FC = () => {
  const { navigateProgress } = useNavigation();
  const { dashboard, loading: dashboardLoading, error: dashboardError, refresh: refreshDashboard } =
    useProgressDashboard();
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    preset,
    from,
    to,
    setPreset,
    refresh: refreshSummary,
  } = useProgressSummary({ initialPreset: '30D' });

  const loading = dashboardLoading && summaryLoading;
  const error = dashboardError || summaryError;

  const onRefresh = async () => {
    await Promise.all([refreshDashboard(), refreshSummary()]);
  };

  const effectiveSummary = summary || dashboard?.summary || null;
  const effectiveVolume = dashboard?.totalVolume || null;
  const prHighlights = dashboard?.prHighlights || [];

  return (
    <Screen padding="md" testID="progress-home-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand.emerald}
            colors={[theme.colors.brand.emerald]}
          />
        }
      >
        <View style={styles.header}>
          <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
            PROGRESS
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Training Progression & Performance Analytics
          </Text>
        </View>

        <DateRangeSelector
          selectedPreset={preset}
          onPresetChange={setPreset}
          from={from}
          to={to}
          style={styles.dateSelector}
        />

        {error && <ProgressErrorState error={error} onRetry={onRefresh} />}

        {loading && !effectiveSummary ? (
          <View style={styles.loaderContainer}>
            <LoadingIndicator size="large" />
          </View>
        ) : (
          <>
            {/* Summary Overview */}
            <ProgressSummaryCard
              summary={effectiveSummary}
              onPress={() => navigateProgress('ProgressSummary', { from, to })}
              style={styles.sectionCard}
            />

            {/* Quick Actions Grid */}
            <ProgressSectionHeader title="Analytics Domains" subtitle="Explore specific metrics" />
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigateProgress('WorkoutFrequency', { from, to })}
                accessibilityRole="button"
                accessibilityLabel="View workout frequency"
                testID="action-frequency"
              >
                <Card elevation="elevation2" style={styles.actionInner}>
                  <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                    Frequency
                  </Text>
                  <Text variant="caption" color={theme.colors.text.muted}>
                    Pace & Consistency
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigateProgress('TrainingVolume', { from, to })}
                accessibilityRole="button"
                accessibilityLabel="View training volume"
                testID="action-volume"
              >
                <Card elevation="elevation2" style={styles.actionInner}>
                  <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                    Volume
                  </Text>
                  <Text variant="caption" color={theme.colors.text.muted}>
                    Total Tonnage Lifted
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigateProgress('ExerciseVolume', { from, to })}
                accessibilityRole="button"
                accessibilityLabel="View exercise volume breakdown"
                testID="action-exercise-volume"
              >
                <Card elevation="elevation2" style={styles.actionInner}>
                  <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                    By Exercise
                  </Text>
                  <Text variant="caption" color={theme.colors.text.muted}>
                    Volume Distribution
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigateProgress('MuscleVolume', { from, to })}
                accessibilityRole="button"
                accessibilityLabel="View muscle group volume breakdown"
                testID="action-muscle-volume"
              >
                <Card elevation="elevation2" style={styles.actionInner}>
                  <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                    By Muscle
                  </Text>
                  <Text variant="caption" color={theme.colors.text.muted}>
                    Anatomical Breakdown
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigateProgress('PersonalRecords', { from, to })}
                accessibilityRole="button"
                accessibilityLabel="View personal records"
                testID="action-prs"
              >
                <Card elevation="elevation2" style={styles.actionInner}>
                  <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                    Personal Records
                  </Text>
                  <Text variant="caption" color={theme.colors.text.muted}>
                    PR Milestones
                  </Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigateProgress('ExercisePerformance')}
                accessibilityRole="button"
                accessibilityLabel="View exercise performance"
                testID="action-performance"
              >
                <Card elevation="elevation2" style={styles.actionInner}>
                  <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
                    Performance
                  </Text>
                  <Text variant="caption" color={theme.colors.text.muted}>
                    Exercise Deep Dive
                  </Text>
                </Card>
              </TouchableOpacity>
            </View>

            {/* Total Volume Preview */}
            {effectiveVolume && (
              <View style={styles.section}>
                <ProgressSectionHeader
                  title="Total Volume"
                  actionLabel="All Volume →"
                  onActionPress={() => navigateProgress('TrainingVolume', { from, to })}
                />
                <VolumeSummaryCard
                  volumeSummary={effectiveVolume}
                  onPress={() => navigateProgress('TrainingVolume', { from, to })}
                />
              </View>
            )}

            {/* Personal Records Highlight */}
            {prHighlights.length > 0 && (
              <View style={styles.section}>
                <ProgressSectionHeader
                  title="Personal Records"
                  subtitle="Latest milestones achieved"
                  actionLabel="View All →"
                  onActionPress={() => navigateProgress('PersonalRecords', { from, to })}
                />
                {prHighlights.slice(0, 3).map((pr, idx) => (
                  <PersonalRecordCard
                    key={`${pr.exerciseId}-${idx}`}
                    record={pr}
                    onPress={() =>
                      pr.exerciseId
                        ? navigateProgress('ExercisePerformance', {
                            exerciseId: pr.exerciseId,
                            exerciseName: pr.exerciseName,
                          })
                        : undefined
                    }
                  />
                ))}
              </View>
            )}
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
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    width: '48%',
    flexGrow: 1,
  },
  actionInner: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
});
