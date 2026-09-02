import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';
import { WorkoutSessionDTO } from '../home.types';

export interface TrainingHomeCardProps {
  recentWorkout: WorkoutSessionDTO | null;
  onStartWorkout: () => void;
  onViewHistory?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const TrainingHomeCard: React.FC<TrainingHomeCardProps> = ({
  recentWorkout,
  onStartWorkout,
  onViewHistory,
  style,
}) => {
  const lastWorkoutDate = recentWorkout?.completedAt
    ? recentWorkout.completedAt.slice(0, 10)
    : recentWorkout?.startedAt
    ? recentWorkout.startedAt.slice(0, 10)
    : null;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID="training-home-card">
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} style={styles.badgeText}>
            TRAIN
          </Text>
        </View>

        {lastWorkoutDate && (
          <Text variant="caption" color={theme.colors.text.muted}>
            Last session: {lastWorkoutDate}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          Ready to Train?
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary} style={styles.subtitle}>
          Execute your scheduled routine or select a workout template.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Button
          label="Start Workout"
          variant="primary"
          size="md"
          onPress={onStartWorkout}
          style={styles.startButton}
          testID="start-workout-btn"
        />
        {onViewHistory && (
          <Button
            label="History"
            variant="secondary"
            size="md"
            onPress={onViewHistory}
            style={styles.historyButton}
            testID="view-history-btn"
          />
        )}
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
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs / 2,
  },
  subtitle: {
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  startButton: {
    flex: 2,
  },
  historyButton: {
    flex: 1,
  },
});
