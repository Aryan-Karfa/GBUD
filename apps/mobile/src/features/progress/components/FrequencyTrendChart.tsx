import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text, Card } from '../../../components';
import { theme } from '../../../theme/theme';

export interface FrequencyTrendChartProps {
  workoutsPerWeek: number;
  completedWorkouts: number;
  trainingDays: number;
  totalWorkouts: number;
  style?: StyleProp<ViewStyle>;
}

export const FrequencyTrendChart: React.FC<FrequencyTrendChartProps> = ({
  workoutsPerWeek,
  completedWorkouts,
  trainingDays,
  totalWorkouts,
  style,
}) => {
  // Consistency visualization relative to a 7-day week max
  const maxWeeklyDays = 7;
  const weeklyRatio = Math.min(1, Math.max(0, workoutsPerWeek / maxWeeklyDays));
  const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
      <View style={styles.header}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
          Training Frequency & Consistency
        </Text>
        <Text variant="caption" color={theme.colors.text.muted}>
          {workoutsPerWeek} / week
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.barSection}>
          <View style={styles.barLabelRow}>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Weekly Training Pace
            </Text>
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
              {workoutsPerWeek} days / week
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${weeklyRatio * 100}%` }]} />
          </View>
        </View>

        <View style={styles.barSection}>
          <View style={styles.barLabelRow}>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Workout Completion Rate
            </Text>
            <Text variant="caption" weight="bold" color={theme.colors.text.primary}>
              {completionRate}% ({completedWorkouts} of {totalWorkouts})
            </Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${completionRate}%`,
                  backgroundColor: theme.colors.brand.cyan,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Total Active Training Days: <Text variant="caption" weight="bold" color={theme.colors.text.primary}>{trainingDays}</Text>
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
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  content: {
    gap: theme.spacing.md,
  },
  barSection: {
    gap: theme.spacing.xs,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.emerald,
  },
  footerRow: {
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
  },
});
