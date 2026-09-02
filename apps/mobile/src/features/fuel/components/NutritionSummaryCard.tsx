import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NutritionDailySummaryDTO, NutritionTargetComparisonDTO } from '../fuel.types';
import { NutritionProgressRow } from './NutritionProgressRow';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface NutritionSummaryCardProps {
  summary?: NutritionDailySummaryDTO | null;
  comparison?: NutritionTargetComparisonDTO | null;
  testID?: string;
}

export const NutritionSummaryCard: React.FC<NutritionSummaryCardProps> = ({
  summary,
  comparison,
  testID = 'nutrition-summary-card',
}) => {
  const calories = summary?.calories ?? 0;
  const protein = summary?.protein ?? 0;
  const carbs = summary?.carbohydrates ?? 0;
  const fat = summary?.fat ?? 0;
  const mealsCount = summary?.meals ?? 0;

  const target = comparison?.target;

  return (
    <Card style={styles.card} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="caption" style={styles.subtitle}>
            DAILY NUTRITION OVERVIEW
          </Text>
          <Text variant="heading" style={styles.title}>
            Today's Fuel
          </Text>
        </View>
        <View style={styles.mealsBadge}>
          <Text style={styles.mealsBadgeText}>
            {mealsCount} {mealsCount === 1 ? 'Meal' : 'Meals'}
          </Text>
        </View>
      </View>

      {/* Progress Rows */}
      <View style={styles.rows}>
        <NutritionProgressRow
          label="CALORIES"
          actual={calories}
          target={target?.calories}
          unit="kcal"
          accentColor={theme.colors.brand.amber}
          testID={`${testID}-calories`}
        />

        <NutritionProgressRow
          label="PROTEIN"
          actual={protein}
          target={target?.protein}
          unit="g"
          accentColor={theme.colors.brand.emerald}
          testID={`${testID}-protein`}
        />

        <NutritionProgressRow
          label="CARBS"
          actual={carbs}
          target={target?.carbohydrates}
          unit="g"
          accentColor={theme.colors.brand.cyan}
          testID={`${testID}-carbs`}
        />

        <NutritionProgressRow
          label="FAT"
          actual={fat}
          target={target?.fat}
          unit="g"
          accentColor="#a78bfa"
          testID={`${testID}-fat`}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 9,
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    marginTop: 1,
  },
  mealsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
  },
  mealsBadgeText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.weights.medium,
  },
  rows: {
    gap: 6,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
});
