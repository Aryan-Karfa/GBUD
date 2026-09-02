import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { WorkoutTimer } from '../components/WorkoutTimer';
import { theme } from '../../../theme/theme';

export const TrainHomeScreen: React.FC = () => {
  const { navigateTrain } = useNavigation();
  const { activeSession, isLoading: sessionLoading, checkActiveSession } = useWorkoutSession();
  const { history, isLoading: historyLoading } = useWorkoutHistory({ limit: 3 });

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  const recentSessions = history.slice(0, 3);

  return (
    <Screen scrollable={true} testID="train-home-screen">
      <View style={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <Text variant="hero" style={styles.title}>
            TRAIN
          </Text>
          <Text variant="muted" style={styles.subtitle}>
            Plan, execute, and track your workouts
          </Text>
        </View>

        {/* Active Workout Banner (if session exists) */}
        {sessionLoading ? (
          <View style={styles.loadingBanner}>
            <LoadingIndicator size="small" />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 4 }}>
              Checking active workout...
            </Text>
          </View>
        ) : activeSession ? (
          <Card style={styles.activeBanner} testID="active-workout-banner">
            <View style={styles.activeBannerHeader}>
              <View style={styles.statusIndicator}>
                <View style={styles.pulsingDot} />
                <Text style={styles.activeStatusText}>WORKOUT IN PROGRESS</Text>
              </View>
              <WorkoutTimer
                startedAt={activeSession.startedAt}
                style={styles.activeTimer}
              />
            </View>

            <Text variant="heading" style={styles.activeWorkoutTitle}>
              Active Session
            </Text>
            <Text variant="muted" style={styles.activeExerciseCount}>
              {activeSession.sessionExercises?.length ?? 0} exercises in progress
            </Text>

            <View style={styles.activeActions}>
              <Button
                variant="primary"
                size="md"
                label="Continue Workout"
                onPress={() =>
                  navigateTrain('ActiveWorkout', { sessionId: activeSession.id })
                }
                testID="continue-workout-btn"
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.startCard} testID="start-workout-card">
            <Text variant="heading" style={styles.startTitle}>
              Ready to Train?
            </Text>
            <Text variant="muted" style={styles.startSubtitle}>
              Choose a workout template to start logging sets and reps.
            </Text>
            <Button
              variant="primary"
              size="md"
              label="Start Workout"
              onPress={() => navigateTrain('WorkoutTemplates')}
              testID="start-workout-btn"
            />
          </Card>
        )}

        {/* Quick Actions Grid */}
        <Text variant="subheading" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.grid}>
          <Card
            onPress={() => navigateTrain('WorkoutTemplates')}
            style={styles.gridCard}
            testID="action-templates"
          >
            <Text style={styles.gridIcon}>📋</Text>
            <Text variant="heading" style={styles.gridTitle}>
              Templates
            </Text>
            <Text variant="caption" style={styles.gridDesc}>
              Create & manage routines
            </Text>
          </Card>

          <Card
            onPress={() => navigateTrain('ExerciseLibrary')}
            style={styles.gridCard}
            testID="action-exercises"
          >
            <Text style={styles.gridIcon}>📖</Text>
            <Text variant="heading" style={styles.gridTitle}>
              Exercises
            </Text>
            <Text variant="caption" style={styles.gridDesc}>
              Browse catalog & form
            </Text>
          </Card>

          <Card
            onPress={() => navigateTrain('WorkoutHistory')}
            style={styles.gridCard}
            testID="action-history"
          >
            <Text style={styles.gridIcon}>⏱️</Text>
            <Text variant="heading" style={styles.gridTitle}>
              History
            </Text>
            <Text variant="caption" style={styles.gridDesc}>
              Review logged workouts
            </Text>
          </Card>
        </View>

        {/* Recent Workouts */}
        <View style={styles.recentHeader}>
          <Text variant="subheading" style={styles.sectionTitle}>
            Recent Activity
          </Text>
          {recentSessions.length > 0 && (
            <TouchableOpacity onPress={() => navigateTrain('WorkoutHistory')}>
              <Text variant="caption" style={styles.seeAllText}>
                See All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {historyLoading ? (
          <View style={{ paddingVertical: 12, alignItems: 'center' }}>
            <LoadingIndicator size="small" />
          </View>
        ) : recentSessions.length === 0 ? (
          <Card style={styles.emptyRecentCard}>
            <Text variant="muted" style={styles.emptyText}>
              No workouts logged yet. Start your first session above!
            </Text>
          </Card>
        ) : (
          recentSessions.map((s) => {
            const isCompleted = s.status === 'COMPLETED';
            const dateStr = new Date(s.startedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
            const exerciseCount = s.sessionExercises?.length ?? 0;

            return (
              <Card
                key={s.id}
                style={styles.recentCard}
                onPress={() => navigateTrain('WorkoutHistoryDetail', { sessionId: s.id })}
                testID={`recent-session-${s.id}`}
              >
                <View style={styles.recentCardHeader}>
                  <Text variant="heading" style={styles.recentTitle}>
                    Workout Session
                  </Text>
                  <View
                    style={[
                      styles.recentBadge,
                      isCompleted ? styles.completedBadge : styles.abandonedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentBadgeText,
                        isCompleted ? styles.completedBadgeText : styles.abandonedBadgeText,
                      ]}
                    >
                      {s.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.recentMeta}>
                  <Text variant="caption">{dateStr}</Text>
                  <Text variant="caption" style={styles.dotSeparator}>
                    •
                  </Text>
                  <Text variant="caption">{exerciseCount} exercises</Text>
                </View>
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.title,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.muted,
    marginTop: 4,
  },
  loadingBanner: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  activeBanner: {
    padding: theme.spacing.md,
    borderColor: theme.colors.brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    marginBottom: theme.spacing.lg,
  },
  activeBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.emerald,
    marginRight: 6,
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.emerald,
    letterSpacing: 0.5,
  },
  activeTimer: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.brand.emerald,
  },
  activeWorkoutTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  activeExerciseCount: {
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  activeActions: {
    marginTop: theme.spacing.md,
  },
  startCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  startTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  startSubtitle: {
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  gridCard: {
    flex: 1,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  gridIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  gridDesc: {
    fontSize: 9,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  seeAllText: {
    color: theme.colors.brand.emerald,
    fontWeight: theme.typography.weights.semibold,
  },
  emptyRecentCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.xs,
    textAlign: 'center',
  },
  recentCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  recentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  recentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  abandonedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  recentBadgeText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold,
  },
  completedBadgeText: {
    color: theme.colors.brand.emerald,
  },
  abandonedBadgeText: {
    color: theme.colors.status.error,
  },
  recentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dotSeparator: {
    marginHorizontal: 4,
  },
});
