import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/layout/Card';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import {
  DateSelector,
  NutritionSummaryCard,
  MealCard,
  FuelErrorState,
} from '../components';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { useMeals } from '../hooks/useMeals';
import { getTodayDateString } from '../fuel.types';
import { theme } from '../../../theme/theme';

export interface FuelHomeScreenProps {
  initialDate?: string;
}

export const FuelHomeScreen: React.FC<FuelHomeScreenProps> = ({
  initialDate,
}) => {
  const { navigateFuel } = useNavigation();
  const today = initialDate || getTodayDateString();

  const {
    date,
    setDate,
    summary,
    comparison,
    isLoading: isDailyLoading,
    isRefreshing: isDailyRefreshing,
    error: dailyError,
    refresh: refreshDaily,
  } = useDailyNutrition({ initialDate: today });

  const {
    meals,
    isLoading: isMealsLoading,
    isRefreshing: isMealsRefreshing,
    error: mealsError,
    refresh: refreshMeals,
  } = useMeals({ initialDate: today });

  const isLoading = isDailyLoading && !summary;
  const isRefreshing = isDailyRefreshing || isMealsRefreshing;
  const error = dailyError || mealsError;

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  const handleRefresh = async () => {
    await Promise.all([refreshDaily(), refreshMeals()]);
  };

  return (
    <Screen padding="md" testID="fuel-home-screen">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.brand.amber}
          />
        }
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <Text variant="caption" style={styles.headerTag}>
            FUEL DOMAIN
          </Text>
          <Text variant="title" style={styles.headerTitle}>
            Nutrition & Fuel
          </Text>
        </View>

        {/* Calendar Date Navigator */}
        <DateSelector
          selectedDate={date}
          onDateChange={handleDateChange}
          testID="fuel-date-selector"
        />

        {error && (
          <FuelErrorState
            error={error}
            onRetry={handleRefresh}
            testID="fuel-home-error"
          />
        )}

        {isLoading ? (
          <View style={styles.centerLoading}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Loading daily nutrition...
            </Text>
          </View>
        ) : (
          <>
            {/* Daily Summary & Macro Targets */}
            <NutritionSummaryCard
              summary={summary}
              comparison={comparison}
              testID="fuel-summary-card"
            />

            {/* Meals Section */}
            <View style={styles.mealsSection}>
              <View style={styles.sectionHeader}>
                <Text variant="heading" style={styles.sectionTitle}>
                  Meals ({meals.length})
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  label="+ Add Meal"
                  fullWidth={false}
                  onPress={() => navigateFuel('MealEditor', { date })}
                  testID="add-meal-header-btn"
                />
              </View>

              {meals.length === 0 ? (
                <Card style={styles.emptyCard} testID="no-meals-card">
                  <Text style={styles.emptyIcon}>🍽️</Text>
                  <Text variant="subheading" style={styles.emptyTitle}>
                    No meals logged for this date
                  </Text>
                  <Text variant="muted" align="center" style={styles.emptySubtitle}>
                    Keep track of your nutrition by logging your breakfast, lunch, dinner, or snacks.
                  </Text>
                  <Button
                    variant="primary"
                    size="sm"
                    label="+ Log First Meal"
                    fullWidth={false}
                    onPress={() => navigateFuel('MealEditor', { date })}
                    style={{ marginTop: theme.spacing.sm }}
                    testID="log-first-meal-btn"
                  />
                </Card>
              ) : (
                meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onPress={() => navigateFuel('MealDetail', { mealId: meal.id })}
                    testID={`meal-card-${meal.id}`}
                  />
                ))
              )}
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.quickActionsSection}>
              <Text variant="heading" style={styles.sectionTitle}>
                Quick Actions
              </Text>

              <View style={styles.quickGrid}>
                <Card
                  onPress={() => navigateFuel('FoodLibrary')}
                  style={styles.quickCard}
                  testID="quick-foods-btn"
                >
                  <Text style={styles.quickIcon}>🥗</Text>
                  <Text variant="heading" style={styles.quickTitle}>
                    Foods
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Catalog & Custom
                  </Text>
                </Card>

                <Card
                  onPress={() => navigateFuel('NutritionTarget', { date })}
                  style={styles.quickCard}
                  testID="quick-targets-btn"
                >
                  <Text style={styles.quickIcon}>🎯</Text>
                  <Text variant="heading" style={styles.quickTitle}>
                    Targets
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Daily Goals
                  </Text>
                </Card>

                <Card
                  onPress={() => navigateFuel('NutritionHistory')}
                  style={styles.quickCard}
                  testID="quick-history-btn"
                >
                  <Text style={styles.quickIcon}>📅</Text>
                  <Text variant="heading" style={styles.quickTitle}>
                    History
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Past Intakes
                  </Text>
                </Card>

                <Card
                  onPress={() => navigateFuel('NutritionComparison', { dateA: date })}
                  style={styles.quickCard}
                  testID="quick-compare-btn"
                >
                  <Text style={styles.quickIcon}>⚖️</Text>
                  <Text variant="heading" style={styles.quickTitle}>
                    Compare
                  </Text>
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    Day vs Day
                  </Text>
                </Card>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text.primary,
  },
  centerLoading: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: theme.spacing.xs,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.sm,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  quickActionsSection: {
    marginTop: theme.spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  quickCard: {
    width: '48%',
    padding: theme.spacing.md,
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickTitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
});
