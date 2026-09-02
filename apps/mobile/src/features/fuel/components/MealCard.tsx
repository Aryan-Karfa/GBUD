import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MealDTO } from '../fuel.types';
import { MealTypeBadge } from './MealTypeBadge';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface MealCardProps {
  meal: MealDTO;
  onPress?: () => void;
  testID?: string;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onPress,
  testID = 'meal-card',
}) => {
  const foodCount = meal.entries?.length ?? 0;

  return (
    <Card onPress={onPress} style={styles.card} testID={testID}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text variant="heading" style={styles.title} numberOfLines={1}>
            {meal.name}
          </Text>
          <Text variant="muted" style={styles.foodCount}>
            {foodCount} {foodCount === 1 ? 'food item' : 'food items'}
          </Text>
        </View>
        <MealTypeBadge mealType={meal.mealType} size="sm" />
      </View>

      {/* Entry preview list if items exist */}
      {foodCount > 0 && (
        <View style={styles.previewContainer}>
          <Text variant="caption" numberOfLines={1} style={styles.previewText}>
            {meal.entries
              .slice(0, 3)
              .map((e) => e.foodNameSnapshot)
              .join(' • ')}
            {foodCount > 3 ? ` • +${foodCount - 3} more` : ''}
          </Text>
        </View>
      )}

      {/* Totals Row */}
      <View style={styles.totalsRow}>
        <View style={styles.totalItem}>
          <Text variant="caption" style={styles.totalLabel}>
            CALORIES
          </Text>
          <Text variant="body" style={styles.calorieValue}>
            {Math.round(meal.totalCalories)} kcal
          </Text>
        </View>

        <View style={styles.totalItem}>
          <Text variant="caption" style={styles.totalLabel}>
            PROTEIN
          </Text>
          <Text variant="body" style={styles.macroValue}>
            {Math.round(meal.totalProtein)}g
          </Text>
        </View>

        <View style={styles.totalItem}>
          <Text variant="caption" style={styles.totalLabel}>
            CARBS
          </Text>
          <Text variant="body" style={styles.macroValue}>
            {Math.round(meal.totalCarbohydrates)}g
          </Text>
        </View>

        <View style={styles.totalItem}>
          <Text variant="caption" style={styles.totalLabel}>
            FAT
          </Text>
          <Text variant="body" style={styles.macroValue}>
            {Math.round(meal.totalFat)}g
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  titleArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  foodCount: {
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
    color: theme.colors.brand.amber,
  },
  previewContainer: {
    marginVertical: theme.spacing.xs,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.xs,
  },
  previewText: {
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  totalItem: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  calorieValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  macroValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
});
