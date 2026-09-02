import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import { FuelErrorState } from '../components';
import { getTodayDateString, shiftDateString, formatCalendarDate } from '../fuel.types';
import { theme } from '../../../theme/theme';

export const NutritionHistoryScreen: React.FC = () => {
  const { navigateFuel, goBack } = useNavigation();
  const today = getTodayDateString();
  const past30Days = shiftDateString(today, -30);

  const { history, isLoading, isRefreshing, error, fetchHistory } = useDailyNutrition({
    autoFetch: false,
  });

  useEffect(() => {
    fetchHistory(past30Days, today);
  }, [fetchHistory, past30Days, today]);

  const handleRefresh = () => {
    fetchHistory(past30Days, today);
  };

  return (
    <Screen padding="md" testID="nutrition-history-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="history-back-btn"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text variant="title" style={styles.title}>
            Nutrition History
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Daily Intake Log (Last 30 Days)
          </Text>
        </View>
      </View>

      {error && (
        <FuelErrorState
          error={error}
          onRetry={handleRefresh}
          testID="history-error"
        />
      )}

      {isLoading && history.length === 0 ? (
        <View style={styles.center}>
          <LoadingIndicator />
          <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
            Loading nutrition history...
          </Text>
        </View>
      ) : history.length === 0 ? (
        <Card style={styles.emptyCard} testID="no-history-state">
          <Text variant="subheading" color={theme.colors.text.secondary} style={{ marginBottom: 4 }}>
            No nutrition history yet
          </Text>
          <Text variant="caption" color={theme.colors.text.muted} align="center">
            As you log meals, your daily nutrition intake totals will appear here.
          </Text>
        </Card>
      ) : (
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
          {history.map((day) => (
            <Card
              key={day.date}
              onPress={() => navigateFuel('Meals', { date: day.date })}
              style={styles.dayCard}
              testID={`history-day-${day.date}`}
            >
              <View style={styles.cardHeader}>
                <Text variant="heading" style={styles.dateText}>
                  {formatCalendarDate(day.date)}
                </Text>
                <View style={styles.mealsBadge}>
                  <Text style={styles.mealsBadgeText}>
                    {day.meals} {day.meals === 1 ? 'meal' : 'meals'}
                  </Text>
                </View>
              </View>

              <View style={styles.macrosRow}>
                <View style={styles.macroCol}>
                  <Text variant="caption" style={styles.macroLabel}>
                    CALORIES
                  </Text>
                  <Text variant="body" style={styles.calorieText}>
                    {Math.round(day.calories)} kcal
                  </Text>
                </View>

                <View style={styles.macroCol}>
                  <Text variant="caption" style={styles.macroLabel}>
                    PROTEIN
                  </Text>
                  <Text variant="body" style={styles.macroVal}>
                    {Math.round(day.protein)}g
                  </Text>
                </View>

                <View style={styles.macroCol}>
                  <Text variant="caption" style={styles.macroLabel}>
                    CARBS
                  </Text>
                  <Text variant="body" style={styles.macroVal}>
                    {Math.round(day.carbohydrates)}g
                  </Text>
                </View>

                <View style={styles.macroCol}>
                  <Text variant="caption" style={styles.macroLabel}>
                    FAT
                  </Text>
                  <Text variant="body" style={styles.macroVal}>
                    {Math.round(day.fat)}g
                  </Text>
                </View>
              </View>
            </Card>
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
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
    gap: theme.spacing.xs,
  },
  dayCard: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  mealsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  mealsBadgeText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  macroCol: {
    alignItems: 'flex-start',
  },
  macroLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  calorieText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  macroVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});
