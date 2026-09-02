import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { WorkoutSessionDTO, MealDTO, PersonalRecordItemDTO } from '../home.types';

export interface RecentActivityCardProps {
  recentWorkout: WorkoutSessionDTO | null;
  latestMeal: MealDTO | null;
  latestPR: PersonalRecordItemDTO | null;
  onWorkoutPress?: () => void;
  onMealPress?: () => void;
  onPRPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  recentWorkout,
  latestMeal,
  latestPR,
  onWorkoutPress,
  onMealPress,
  onPRPress,
  style,
}) => {
  const hasCompletedWorkout = recentWorkout && recentWorkout.status === 'COMPLETED';
  const hasMeal = Boolean(latestMeal);
  const hasPR = Boolean(latestPR);

  // If no authoritative activity exists, omit the card completely
  if (!hasCompletedWorkout && !hasMeal && !hasPR) {
    return null;
  }

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID="recent-activity-card">
      <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
        Recent Activity
      </Text>

      <View style={styles.activityList}>
        {hasCompletedWorkout && recentWorkout && (
          <TouchableOpacity
            style={styles.activityItem}
            onPress={onWorkoutPress}
            activeOpacity={onWorkoutPress ? 0.7 : 1}
            accessibilityRole={onWorkoutPress ? 'button' : undefined}
            accessibilityLabel="View recent workout"
          >
            <View style={styles.iconContainer}>
              <Text style={styles.activityIcon}>🏋️</Text>
            </View>
            <View style={styles.activityDetails}>
              <Text variant="body" weight="medium" color={theme.colors.text.primary} numberOfLines={1}>
                Workout Completed
              </Text>
              <Text variant="caption" color={theme.colors.text.muted}>
                {recentWorkout.completedAt ? recentWorkout.completedAt.slice(0, 10) : 'Recently completed'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {hasMeal && latestMeal && (
          <TouchableOpacity
            style={styles.activityItem}
            onPress={onMealPress}
            activeOpacity={onMealPress ? 0.7 : 1}
            accessibilityRole={onMealPress ? 'button' : undefined}
            accessibilityLabel="View logged meal"
          >
            <View style={styles.iconContainer}>
              <Text style={styles.activityIcon}>🥗</Text>
            </View>
            <View style={styles.activityDetails}>
              <Text variant="body" weight="medium" color={theme.colors.text.primary} numberOfLines={1}>
                {latestMeal.name || latestMeal.mealType || 'Meal Logged'}
              </Text>
              <Text variant="caption" color={theme.colors.text.muted}>
                {latestMeal.mealDate || 'Logged today'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {hasPR && latestPR && (
          <TouchableOpacity
            style={styles.activityItem}
            onPress={onPRPress}
            activeOpacity={onPRPress ? 0.7 : 1}
            accessibilityRole={onPRPress ? 'button' : undefined}
            accessibilityLabel="View personal record"
          >
            <View style={styles.iconContainer}>
              <Text style={styles.activityIcon}>🏆</Text>
            </View>
            <View style={styles.activityDetails}>
              <Text variant="body" weight="medium" color={theme.colors.text.primary} numberOfLines={1}>
                PR: {latestPR.exerciseName}
              </Text>
              <Text variant="caption" color={theme.colors.brand.emerald}>
                {latestPR.estimated1RM !== null
                  ? `${latestPR.estimated1RM} kg est. 1RM`
                  : `${latestPR.maxWeight} kg best weight`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  activityList: {
    gap: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityIcon: {
    fontSize: 16,
  },
  activityDetails: {
    flex: 1,
  },
});
