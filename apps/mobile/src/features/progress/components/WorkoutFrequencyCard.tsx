import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { TrainingFrequencyDTO } from '../progress.types';

export interface WorkoutFrequencyCardProps {
  frequency: TrainingFrequencyDTO | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const WorkoutFrequencyCard: React.FC<WorkoutFrequencyCardProps> = ({
  frequency,
  onPress,
  style,
}) => {
  if (!frequency) {
    return (
      <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
        <Text variant="body" color={theme.colors.text.muted} align="center">
          No frequency data available for this period.
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
      accessibilityLabel="Workout frequency details"
      style={style}
    >
      <Card elevation="elevation2" style={styles.card}>
        <View style={styles.header}>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
            Workout Frequency
          </Text>
          {onPress && (
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
              Details →
            </Text>
          )}
        </View>

        <View style={styles.primaryMetric}>
          <Text variant="caption" color={theme.colors.text.muted}>
            WORKOUTS PER WEEK
          </Text>
          <Text variant="hero" weight="bold" color={theme.colors.brand.emerald} style={styles.primaryValue}>
            {frequency.workoutsPerWeek}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text variant="caption" color={theme.colors.text.muted}>
              COMPLETED
            </Text>
            <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
              {frequency.completedWorkouts}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text variant="caption" color={theme.colors.text.muted}>
              TRAINING DAYS
            </Text>
            <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
              {frequency.trainingDays}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text variant="caption" color={theme.colors.text.muted}>
              TOTAL SESSIONS
            </Text>
            <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
              {frequency.totalWorkouts}
            </Text>
          </View>
        </View>

        {frequency.abandonedWorkouts > 0 && (
          <View style={styles.notice}>
            <Text variant="caption" color={theme.colors.text.muted}>
              {frequency.abandonedWorkouts} session{frequency.abandonedWorkouts > 1 ? 's were' : ' was'} abandoned and not counted as completed.
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
  primaryMetric: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  primaryValue: {
    fontSize: 40,
    lineHeight: 48,
    marginTop: theme.spacing.xs / 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
    paddingTop: theme.spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  notice: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    alignItems: 'center',
  },
});
