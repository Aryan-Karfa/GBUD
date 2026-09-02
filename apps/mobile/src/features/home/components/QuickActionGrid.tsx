import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';

export interface QuickActionGridProps {
  hasActiveWorkout: boolean;
  onWorkoutAction: () => void;
  onMealAction: () => void;
  onProgressAction: () => void;
  style?: object;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  hasActiveWorkout,
  onWorkoutAction,
  onMealAction,
  onProgressAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]} testID="quick-action-grid">
      <TouchableOpacity
        style={styles.actionItem}
        onPress={onWorkoutAction}
        accessibilityRole="button"
        accessibilityLabel={hasActiveWorkout ? 'Continue Active Workout' : 'Start Workout'}
        testID="action-workout"
      >
        <Card
          elevation="elevation2"
          style={[styles.card, hasActiveWorkout ? styles.activeCard : {}]}
        >
          <Text style={styles.icon}>{hasActiveWorkout ? '⚡' : '🏋️'}</Text>
          <Text
            variant="caption"
            weight="bold"
            color={hasActiveWorkout ? theme.colors.brand.emerald : theme.colors.text.primary}
            numberOfLines={1}
            style={styles.label}
          >
            {hasActiveWorkout ? 'Continue' : 'Start'}
          </Text>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={onMealAction}
        accessibilityRole="button"
        accessibilityLabel="Log a meal"
        testID="action-meal"
      >
        <Card elevation="elevation2" style={styles.card}>
          <Text style={styles.icon}>🥗</Text>
          <Text variant="caption" weight="bold" color={theme.colors.text.primary} numberOfLines={1} style={styles.label}>
            Log Meal
          </Text>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={onProgressAction}
        accessibilityRole="button"
        accessibilityLabel="View training analytics"
        testID="action-progress"
      >
        <Card elevation="elevation2" style={styles.card}>
          <Text style={styles.icon}>📈</Text>
          <Text variant="caption" weight="bold" color={theme.colors.text.primary} numberOfLines={1} style={styles.label}>
            Analytics
          </Text>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionItem: {
    flex: 1,
  },
  card: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  activeCard: {
    borderWidth: 1,
    borderColor: theme.colors.brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  icon: {
    fontSize: 22,
    marginBottom: theme.spacing.xs / 2,
  },
  label: {
    letterSpacing: 0.3,
  },
});
