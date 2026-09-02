import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/common/Text';
import { WorkoutTimer } from './WorkoutTimer';
import { theme } from '../../../theme/theme';

export interface WorkoutProgressHeaderProps {
  title: string;
  startedAt: string;
  exerciseCount: number;
  completedSetsCount: number;
  status?: string;
  testID?: string;
}

export const WorkoutProgressHeader: React.FC<WorkoutProgressHeaderProps> = ({
  title,
  startedAt,
  exerciseCount,
  completedSetsCount,
  status = 'IN_PROGRESS',
  testID = 'workout-progress-header',
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {/* Top Row: Title & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text variant="title" style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status.replace('_', ' ')}</Text>
        </View>
      </View>

      {/* Stats Row: Live Timer & Progress */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text variant="caption" style={styles.statLabel}>
            DURATION
          </Text>
          <WorkoutTimer startedAt={startedAt} style={styles.timerText} />
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text variant="caption" style={styles.statLabel}>
            EXERCISES
          </Text>
          <Text variant="heading" style={styles.statValue}>
            {exerciseCount}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text variant="caption" style={styles.statLabel}>
            SETS LOGGED
          </Text>
          <Text variant="heading" style={styles.statValue}>
            {completedSetsCount}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.brand.emerald,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.emerald,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  timerText: {
    fontSize: theme.typography.sizes.md,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
