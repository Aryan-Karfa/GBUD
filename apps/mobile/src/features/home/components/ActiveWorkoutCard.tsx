import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';
import { WorkoutSessionDTO } from '../home.types';

export interface ActiveWorkoutCardProps {
  session: WorkoutSessionDTO;
  onContinue: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ActiveWorkoutCard: React.FC<ActiveWorkoutCardProps> = ({
  session,
  onContinue,
  style,
}) => {
  const exerciseCount = session.sessionExercises?.length || 0;
  const startedTime = session.startedAt ? session.startedAt.slice(11, 16) : '';

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID="active-workout-card">
      <View style={styles.header}>
        <View style={styles.badge}>
          <View style={styles.indicatorDot} />
          <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} style={styles.badgeText}>
            WORKOUT IN PROGRESS
          </Text>
        </View>

        {startedTime ? (
          <Text variant="caption" color={theme.colors.text.muted}>
            Started at {startedTime}
          </Text>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          Active Training Session
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary} style={styles.subtitle}>
          {exerciseCount > 0
            ? `${exerciseCount} exercise${exerciseCount > 1 ? 's' : ''} in this session`
            : 'Session is currently running'}
        </Text>
      </View>

      <Button
        label="Continue Workout →"
        variant="primary"
        size="md"
        onPress={onContinue}
        style={styles.continueButton}
        testID="continue-active-workout-btn"
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.xs,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.emerald,
    marginRight: theme.spacing.xs,
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
  continueButton: {
    width: '100%',
  },
});
