import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { ProgressSummaryDTO } from '../progress.types';

export interface ProgressSummaryCardProps {
  summary: ProgressSummaryDTO | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({
  summary,
  onPress,
  style,
}) => {
  if (!summary) {
    return (
      <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
        <Text variant="body" color={theme.colors.text.muted} align="center">
          No training summary available for this period.
        </Text>
      </Card>
    );
  }

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel="Training summary details"
      style={style}
    >
      <Card elevation="elevation2" style={styles.card}>
        <View style={styles.header}>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
            Training Summary
          </Text>
          {onPress && (
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
              Details →
            </Text>
          )}
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text variant="caption" color={theme.colors.text.muted}>
              COMPLETED WORKOUTS
            </Text>
            <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
              {summary.completedWorkouts}
            </Text>
            {summary.abandonedWorkouts > 0 && (
              <Text variant="caption" color={theme.colors.text.muted} style={styles.statSubtext}>
                ({summary.abandonedWorkouts} abandoned)
              </Text>
            )}
          </View>

          <View style={styles.gridItem}>
            <Text variant="caption" color={theme.colors.text.muted}>
              TRAINING DAYS
            </Text>
            <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
              {summary.trainingDays}
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text variant="caption" color={theme.colors.text.muted}>
              TOTAL VOLUME
            </Text>
            <Text variant="heading" weight="bold" color={theme.colors.brand.emerald} style={styles.statValue}>
              {summary.totalVolume.toLocaleString()}
              <Text variant="body" color={theme.colors.text.secondary}> kg</Text>
            </Text>
          </View>

          <View style={styles.gridItem}>
            <Text variant="caption" color={theme.colors.text.muted}>
              SETS / REPS
            </Text>
            <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
              {summary.totalSets} <Text variant="body" color={theme.colors.text.secondary}>/ {summary.totalReps}</Text>
            </Text>
          </View>
        </View>

        {summary.averageWorkoutDurationSeconds > 0 && (
          <View style={styles.footer}>
            <Text variant="caption" color={theme.colors.text.muted}>
              Avg. Duration: <Text variant="caption" weight="medium" color={theme.colors.text.secondary}>{formatDuration(summary.averageWorkoutDurationSeconds)}</Text>
            </Text>
          </View>
        )}
      </Card>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.md,
  },
  gridItem: {
    width: '50%',
    paddingRight: theme.spacing.sm,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: theme.spacing.xs / 2,
  },
  statSubtext: {
    fontSize: 11,
  },
  footer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
  },
});
