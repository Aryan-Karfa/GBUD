import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { WorkoutSessionDTO } from '../train.types';
import { WorkoutExerciseRow } from '../components/WorkoutExerciseRow';
import { formatDuration } from '../components/WorkoutTimer';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { theme } from '../../../theme/theme';

export const WorkoutHistoryDetailScreen: React.FC = () => {
  const { trainParams, goBack } = useNavigation();
  const sessionId = trainParams?.sessionId;
  const { getHistoricalSession } = useWorkoutHistory({ autoFetch: false });

  const [session, setSession] = useState<WorkoutSessionDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!sessionId) {
      setError('Session ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getHistoricalSession(sessionId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setSession(data);
          } else {
            setError('Session not found');
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load historical session');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [sessionId, getHistoricalSession]);

  const isCompleted = session?.status === 'COMPLETED';
  const endTimestamp = session?.completedAt || session?.abandonedAt;
  let durationStr = '—';
  if (session?.startedAt && endTimestamp) {
    const secs = Math.floor(
      (new Date(endTimestamp).getTime() - new Date(session.startedAt).getTime()) / 1000
    );
    if (secs > 0) {
      durationStr = formatDuration(secs);
    }
  }

  const sortedExercises = [...(session?.sessionExercises || [])].sort(
    (a, b) => a.order - b.order
  );

  const totalSets = sortedExercises.reduce(
    (acc, ex) => acc + (ex.sets?.length || 0),
    0
  );

  return (
    <Screen scrollable={true} testID="history-detail-screen">
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="history-detail-back">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text variant="heading" style={styles.headerTitle} numberOfLines={1}>
            Workout Summary
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading historical session snapshot...
            </Text>
          </View>
        ) : error || !session ? (
          <View style={styles.center}>
            <ErrorState message={error || 'Session not found'} onRetry={() => goBack()} />
          </View>
        ) : (
          <View style={styles.content}>
            {/* Session Summary Card */}
            <Card style={styles.summaryCard} testID="history-summary-card">
              <View style={styles.summaryHeader}>
                <View>
                  <Text variant="title" style={styles.sessionTitle}>
                    Workout Session
                  </Text>
                  <Text variant="caption" style={styles.startedDate}>
                    {new Date(session.startedAt).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    isCompleted ? styles.completedBadge : styles.abandonedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isCompleted ? styles.completedText : styles.abandonedText,
                    ]}
                  >
                    {session.status}
                  </Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text variant="caption" style={styles.metricLabel}>
                    DURATION
                  </Text>
                  <Text variant="heading" style={styles.metricValue}>
                    {durationStr}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricItem}>
                  <Text variant="caption" style={styles.metricLabel}>
                    EXERCISES
                  </Text>
                  <Text variant="heading" style={styles.metricValue}>
                    {sortedExercises.length}
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metricItem}>
                  <Text variant="caption" style={styles.metricLabel}>
                    SETS COMPLETED
                  </Text>
                  <Text variant="heading" style={styles.metricValue}>
                    {totalSets}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Read-only exercises list */}
            <Text variant="subheading" style={styles.sectionTitle}>
              Exercise Logs ({sortedExercises.length})
            </Text>

            {sortedExercises.map((exercise) => (
              <WorkoutExerciseRow
                key={exercise.id}
                sessionExercise={exercise}
                readOnly={true}
                testID={`history-exercise-${exercise.id}`}
              />
            ))}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  center: {
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: theme.spacing.md,
  },
  summaryCard: {
    padding: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  sessionTitle: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
  },
  startedDate: {
    marginTop: 2,
    color: theme.colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  abandonedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  completedText: {
    color: theme.colors.brand.emerald,
  },
  abandonedText: {
    color: theme.colors.status.error,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
});
