import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/layout/Card';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { DateSelector, MealCard, FuelErrorState } from '../components';
import { useMeals } from '../hooks/useMeals';
import { getTodayDateString } from '../fuel.types';
import { theme } from '../../../theme/theme';

export interface MealsScreenProps {
  date?: string;
}

export const MealsScreen: React.FC<MealsScreenProps> = ({ date: initialDate }) => {
  const { navigateFuel, goBack } = useNavigation();
  const today = initialDate || getTodayDateString();

  const {
    date,
    setDate,
    meals,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useMeals({ initialDate: today });

  return (
    <Screen padding="md" testID="meals-screen">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
            testID="meals-back-btn"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text variant="title" style={styles.title}>
              Meals
            </Text>
            <Text variant="caption" color={theme.colors.text.secondary}>
              Logged Nutrition Intake
            </Text>
          </View>
        </View>

        <Button
          variant="primary"
          size="sm"
          label="+ Add Meal"
          fullWidth={false}
          onPress={() => navigateFuel('MealEditor', { date })}
          testID="create-meal-header-btn"
        />
      </View>

      <DateSelector
        selectedDate={date}
        onDateChange={setDate}
        testID="meals-date-selector"
      />

      {error && (
        <FuelErrorState
          error={error}
          onRetry={refresh}
          testID="meals-error"
        />
      )}

      {isLoading && meals.length === 0 ? (
        <View style={styles.center}>
          <LoadingIndicator />
          <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
            Loading meals...
          </Text>
        </View>
      ) : meals.length === 0 ? (
        <Card style={styles.emptyCard} testID="no-meals-state">
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text variant="subheading" style={styles.emptyTitle}>
            No meals for this date
          </Text>
          <Text variant="muted" align="center" style={styles.emptySubtitle}>
            You haven't logged any meals for this date yet.
          </Text>
          <Button
            variant="primary"
            size="sm"
            label="+ Add Meal"
            fullWidth={false}
            onPress={() => navigateFuel('MealEditor', { date })}
            style={{ marginTop: theme.spacing.sm }}
            testID="add-first-meal-btn"
          />
        </Card>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={theme.colors.brand.amber}
            />
          }
        >
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => navigateFuel('MealDetail', { mealId: meal.id })}
              testID={`meals-card-${meal.id}`}
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});
