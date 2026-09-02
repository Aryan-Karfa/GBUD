import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { ExercisePerformanceDTO } from '../progress.types';

export interface ExercisePerformanceCardProps {
  performance: ExercisePerformanceDTO | null;
  style?: StyleProp<ViewStyle>;
}

export const ExercisePerformanceCard: React.FC<ExercisePerformanceCardProps> = ({
  performance,
  style,
}) => {
  if (!performance) {
    return (
      <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
        <Text variant="body" color={theme.colors.text.muted} align="center">
          No performance data available for this exercise.
        </Text>
      </Card>
    );
  }

  const { summary, exercise } = performance;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
      <View style={styles.header}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
          {exercise.name}
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Performance Overview
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.gridItem}>
          <Text variant="caption" color={theme.colors.text.muted}>
            ESTIMATED 1RM
          </Text>
          <Text variant="subheading" weight="bold" color={theme.colors.brand.emerald} style={styles.statValue}>
            {summary.estimated1RM !== null ? `${summary.estimated1RM} kg` : '—'}
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text variant="caption" color={theme.colors.text.muted}>
            BEST WEIGHT
          </Text>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
            {summary.maxWeight !== null ? `${summary.maxWeight} kg` : '—'}
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text variant="caption" color={theme.colors.text.muted}>
            TOTAL VOLUME
          </Text>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
            {summary.totalVolume.toLocaleString()} <Text variant="caption" color={theme.colors.text.muted}>kg</Text>
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text variant="caption" color={theme.colors.text.muted}>
            SESSIONS / SETS
          </Text>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.statValue}>
            {summary.sessions} <Text variant="caption" color={theme.colors.text.muted}>/ {summary.sets}</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.md,
  },
  gridItem: {
    width: '50%',
    paddingRight: theme.spacing.sm,
  },
  statValue: {
    marginTop: theme.spacing.xs / 4,
  },
});
