import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { formatDuration } from '../components/WorkoutTimer';
import { Screen } from '../../../components/layout/Screen';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { theme } from '../../../theme/theme';

export const WorkoutHistoryScreen: React.FC = () => {
  const { navigateTrain, goBack } = useNavigation();
  const { history, meta, page, isLoading, isRefreshing, error, refresh, fetchHistory } =
    useWorkoutHistory({ limit: 15 });

  const handleNextPage = () => {
    if (meta && page < meta.totalPages) {
      fetchHistory(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      fetchHistory(page - 1);
    }
  };

  return (
    <Screen scrollable={false} testID="workout-history-screen">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton} testID="history-back-btn">
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <Text variant="title" style={styles.title}>
              Workout History
            </Text>
            {meta && (
              <Text variant="muted" style={styles.subtitle}>
                {meta.total} {meta.total === 1 ? 'workout' : 'workouts'} logged
              </Text>
            )}
          </View>
        </View>

        {/* Content */}
        {error ? (
          <View style={styles.centerContainer}>
            <ErrorState message={error} onRetry={refresh} testID="history-error" />
          </View>
        ) : isLoading && !isRefreshing ? (
          <View style={styles.centerContainer}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading workout history...
            </Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.centerContainer}>
            <EmptyState
              emoji="⏱️"
              title="No workout history yet"
              description="Completed and abandoned workouts will appear here with detailed exercise and set logs."
              actionLabel="Start a Workout"
              onAction={() => navigateTrain('WorkoutTemplates')}
              testID="history-empty"
            />
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {history.map((session) => {
                const isCompleted = session.status === 'COMPLETED';
                const dateStr = new Date(session.startedAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const timeStr = new Date(session.startedAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                // Calculate duration
                let durationStr = '—';
                const endTimestamp = session.completedAt || session.abandonedAt;
                if (endTimestamp) {
                  const durationSecs = Math.floor(
                    (new Date(endTimestamp).getTime() - new Date(session.startedAt).getTime()) / 1000
                  );
                  if (durationSecs > 0) {
                    durationStr = formatDuration(durationSecs);
                  }
                }

                const exerciseCount = session.sessionExercises?.length || 0;
                const totalSets = (session.sessionExercises || []).reduce(
                  (acc, ex) => acc + (ex.sets?.length || 0),
                  0
                );

                return (
                  <Card
                    key={session.id}
                    style={styles.card}
                    onPress={() =>
                      navigateTrain('WorkoutHistoryDetail', { sessionId: session.id })
                    }
                    testID={`history-card-${session.id}`}
                  >
                    <View style={styles.cardHeader}>
                      <Text variant="heading" style={styles.cardTitle}>
                        Workout Session
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          isCompleted ? styles.completedBadge : styles.abandonedBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            isCompleted ? styles.completedText : styles.abandonedText,
                          ]}
                        >
                          {session.status}
                        </Text>
                      </View>
                    </View>

                    <Text variant="caption" style={styles.dateText}>
                      {dateStr} at {timeStr}
                    </Text>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Text variant="caption" style={styles.metricLabel}>
                          DURATION
                        </Text>
                        <Text variant="body" style={styles.metricValue}>
                          {durationStr}
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text variant="caption" style={styles.metricLabel}>
                          EXERCISES
                        </Text>
                        <Text variant="body" style={styles.metricValue}>
                          {exerciseCount}
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Text variant="caption" style={styles.metricLabel}>
                          SETS
                        </Text>
                        <Text variant="body" style={styles.metricValue}>
                          {totalSets}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </ScrollView>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <View style={styles.paginationBar}>
                <Button
                  variant="outline"
                  size="sm"
                  label="← Previous"
                  fullWidth={false}
                  onPress={handlePrevPage}
                  disabled={page <= 1}
                  testID="history-prev-page"
                />
                <Text variant="caption" style={styles.pageIndicator}>
                  Page {page} of {meta.totalPages}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  label="Next →"
                  fullWidth={false}
                  onPress={handleNextPage}
                  disabled={page >= meta.totalPages}
                  testID="history-next-page"
                />
              </View>
            )}
          </>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    paddingRight: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text.primary,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  badge: {
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
  badgeText: {
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
  dateText: {
    marginTop: 4,
    color: theme.colors.text.secondary,
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: theme.spacing.lg,
  },
  metricItem: {},
  metricLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
    backgroundColor: theme.colors.background.primary,
  },
  pageIndicator: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.muted,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});
