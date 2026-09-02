import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { FuelErrorState, DateSelector } from '../components';
import { useDailyNutrition } from '../hooks/useDailyNutrition';
import {
  NutritionDailySummaryDTO,
  getTodayDateString,
  shiftDateString,
  formatCalendarDate,
} from '../fuel.types';
import { theme } from '../../../theme/theme';

export interface NutritionComparisonScreenProps {
  dateA?: string;
  dateB?: string;
}

export const NutritionComparisonScreen: React.FC<NutritionComparisonScreenProps> = ({
  dateA: initialDateA,
  dateB: initialDateB,
}) => {
  const { goBack } = useNavigation();

  const today = getTodayDateString();
  const yesterday = shiftDateString(today, -1);

  const [dateA, setDateA] = useState<string>(initialDateA || today);
  const [dateB, setDateB] = useState<string>(initialDateB || yesterday);

  const { compareTwoDates, isLoading, error } = useDailyNutrition({ autoFetch: false });
  const [dataA, setDataA] = useState<NutritionDailySummaryDTO | null>(null);
  const [dataB, setDataB] = useState<NutritionDailySummaryDTO | null>(null);

  const loadComparison = async (dA = dateA, dB = dateB) => {
    try {
      const res = await compareTwoDates(dA, dB);
      setDataA(res.summaryA);
      setDataB(res.summaryB);
    } catch {
      // Handled by hook error
    }
  };

  useEffect(() => {
    loadComparison(dateA, dateB);
  }, [dateA, dateB]);

  return (
    <Screen padding="md" testID="nutrition-comparison-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="compare-back-btn"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text variant="title" style={styles.title}>
            Nutrition Comparison
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Side-by-Side Date Intake
          </Text>
        </View>
      </View>

      {error && (
        <FuelErrorState
          error={error}
          onRetry={() => loadComparison(dateA, dateB)}
          testID="compare-error"
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date A Selector */}
        <View style={styles.dateSelectorSection}>
          <Text variant="caption" style={styles.dateSelectorLabel}>
            DATE A
          </Text>
          <DateSelector
            selectedDate={dateA}
            onDateChange={setDateA}
            testID="compare-date-a-selector"
          />
        </View>

        {/* Date B Selector */}
        <View style={styles.dateSelectorSection}>
          <Text variant="caption" style={styles.dateSelectorLabel}>
            DATE B
          </Text>
          <DateSelector
            selectedDate={dateB}
            onDateChange={setDateB}
            testID="compare-date-b-selector"
          />
        </View>

        {isLoading && (!dataA || !dataB) ? (
          <View style={styles.center}>
            <LoadingIndicator />
            <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
              Comparing dates...
            </Text>
          </View>
        ) : dataA && dataB ? (
          /* Side-by-Side Comparison Table */
          <Card style={styles.tableCard} testID="comparison-table-card">
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.metricCol}>
                <Text variant="caption" style={styles.colHeader}>
                  METRIC
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="caption" style={styles.colHeader} numberOfLines={1}>
                  {formatCalendarDate(dateA)}
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="caption" style={styles.colHeader} numberOfLines={1}>
                  {formatCalendarDate(dateB)}
                </Text>
              </View>
            </View>

            {/* Row: Calories */}
            <View style={styles.tableRow}>
              <View style={styles.metricCol}>
                <Text variant="body" style={styles.metricName}>
                  Calories
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.calVal}>
                  {Math.round(dataA.calories)} kcal
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.calVal}>
                  {Math.round(dataB.calories)} kcal
                </Text>
              </View>
            </View>

            {/* Row: Protein */}
            <View style={styles.tableRow}>
              <View style={styles.metricCol}>
                <Text variant="body" style={styles.metricName}>
                  Protein
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.macroVal}>
                  {Math.round(dataA.protein)}g
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.macroVal}>
                  {Math.round(dataB.protein)}g
                </Text>
              </View>
            </View>

            {/* Row: Carbohydrates */}
            <View style={styles.tableRow}>
              <View style={styles.metricCol}>
                <Text variant="body" style={styles.metricName}>
                  Carbohydrates
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.macroVal}>
                  {Math.round(dataA.carbohydrates)}g
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.macroVal}>
                  {Math.round(dataB.carbohydrates)}g
                </Text>
              </View>
            </View>

            {/* Row: Fat */}
            <View style={styles.tableRow}>
              <View style={styles.metricCol}>
                <Text variant="body" style={styles.metricName}>
                  Fat
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.macroVal}>
                  {Math.round(dataA.fat)}g
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.macroVal}>
                  {Math.round(dataB.fat)}g
                </Text>
              </View>
            </View>

            {/* Row: Meals Logged */}
            <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
              <View style={styles.metricCol}>
                <Text variant="body" style={styles.metricName}>
                  Meals Logged
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.mealsVal}>
                  {dataA.meals}
                </Text>
              </View>
              <View style={styles.dataCol}>
                <Text variant="body" style={styles.mealsVal}>
                  {dataB.meals}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}
      </ScrollView>
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
    gap: theme.spacing.md,
  },
  dateSelectorSection: {
    gap: 4,
  },
  dateSelectorLabel: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1,
    color: theme.colors.brand.amber,
  },
  tableCard: {
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  colHeader: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: theme.colors.text.muted,
  },
  metricCol: {
    flex: 1.2,
  },
  dataCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricName: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  calVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  macroVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  mealsVal: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  center: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
