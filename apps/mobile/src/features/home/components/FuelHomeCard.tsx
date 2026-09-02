import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';
import { MealDTO, NutritionDailySummaryDTO } from '../home.types';

export interface FuelHomeCardProps {
  todayMeals: MealDTO[];
  summary: NutritionDailySummaryDTO | null;
  onViewFuel: () => void;
  onLogMeal?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const FuelHomeCard: React.FC<FuelHomeCardProps> = ({
  todayMeals,
  summary,
  onViewFuel,
  onLogMeal,
  style,
}) => {
  const mealCount = todayMeals.length;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID="fuel-home-card">
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text variant="caption" weight="bold" color={theme.colors.brand.amber} style={styles.badgeText}>
            FUEL
          </Text>
        </View>

        <Text variant="caption" color={theme.colors.text.muted}>
          {mealCount > 0 ? `${mealCount} meal${mealCount !== 1 ? 's' : ''} logged` : 'No meals logged today'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          Today's Meals
        </Text>

        {mealCount > 0 ? (
          <View style={styles.mealList}>
            {todayMeals.map((m) => (
              <View key={m.id} style={styles.mealItem}>
                <Text variant="body" weight="medium" color={theme.colors.text.primary} numberOfLines={1}>
                  {m.name || m.mealType || 'Meal'}
                </Text>
                <Text variant="caption" color={theme.colors.text.muted}>
                  ✓
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text variant="caption" color={theme.colors.text.secondary} style={styles.emptySubtitle}>
            Log your breakfast, lunch, dinner, or snacks to track daily intake.
          </Text>
        )}

        {/* Calm, non-judgmental compact nutrition summary if meals have been recorded */}
        {summary && summary.meals > 0 && (
          <View style={styles.compactSummary}>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Authoritative Totals:{' '}
              <Text variant="caption" weight="bold" color={theme.colors.text.primary}>
                {Math.round(summary.calories)} kcal
              </Text>
              {' · '}
              <Text variant="caption" weight="medium" color={theme.colors.text.secondary}>
                {Math.round(summary.protein)}g P
              </Text>
              {' · '}
              <Text variant="caption" weight="medium" color={theme.colors.text.secondary}>
                {Math.round(summary.carbohydrates)}g C
              </Text>
              {' · '}
              <Text variant="caption" weight="medium" color={theme.colors.text.secondary}>
                {Math.round(summary.fat)}g F
              </Text>
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <Button
          label="View Fuel →"
          variant="secondary"
          size="md"
          onPress={onViewFuel}
          style={styles.viewButton}
          testID="view-fuel-btn"
        />
        {onLogMeal && (
          <Button
            label="+ Add Meal"
            variant="primary"
            size="md"
            onPress={onLogMeal}
            style={styles.addButton}
            testID="add-meal-home-btn"
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
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  badgeText: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    lineHeight: 18,
  },
  mealList: {
    marginVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.sm,
  },
  compactSummary: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borders.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  viewButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});
