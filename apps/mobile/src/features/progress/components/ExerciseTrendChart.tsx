import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { Text, Card } from '../../../components';
import { theme } from '../../../theme/theme';
import { ExerciseTrendPointDTO, formatCalendarDate } from '../progress.types';

export interface ExerciseTrendChartProps {
  points: ExerciseTrendPointDTO[];
  exerciseName?: string;
  style?: StyleProp<ViewStyle>;
}

export type TrendMetric = '1RM' | 'WEIGHT';

export const ExerciseTrendChart: React.FC<ExerciseTrendChartProps> = ({
  points,
  exerciseName,
  style,
}) => {
  const [metric, setMetric] = useState<TrendMetric>('1RM');

  if (!points || points.length === 0) {
    return (
      <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID="exercise-trend-empty">
        <Text variant="subheading" weight="bold" color={theme.colors.text.primary} style={styles.title}>
          {exerciseName ? `${exerciseName} Trend` : 'Progression Trend'}
        </Text>
        <View style={styles.emptyContainer}>
          <Text variant="body" color={theme.colors.text.muted} align="center">
            No historical trend data points for this exercise.
          </Text>
        </View>
      </Card>
    );
  }

  // Filter valid points for selected metric without interpolating or guessing
  const validPoints = points.map((p) => ({
    date: p.date,
    value: metric === '1RM' ? p.estimated1RM : p.bestWeight,
  }));

  const numericValues = validPoints.map((p) => p.value).filter((v): v is number => v !== null && v !== undefined);
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 100;
  const minValue = numericValues.length > 0 ? Math.min(...numericValues) : 0;
  const range = Math.max(maxValue - minValue, 10);
  const CHART_HEIGHT = 140;

  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
            {exerciseName ? `${exerciseName}` : 'Progression Trend'}
          </Text>
          <Text variant="caption" color={theme.colors.text.muted}>
            {metric === '1RM' ? 'Estimated 1RM (kg)' : 'Best Weight (kg)'}
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, metric === '1RM' && styles.toggleBtnActive]}
            onPress={() => setMetric('1RM')}
            accessibilityRole="button"
            accessibilityLabel="View estimated 1RM trend"
          >
            <Text
              variant="caption"
              weight="bold"
              color={metric === '1RM' ? theme.colors.text.inverse : theme.colors.text.secondary}
            >
              1RM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, metric === 'WEIGHT' && styles.toggleBtnActive]}
            onPress={() => setMetric('WEIGHT')}
            accessibilityRole="button"
            accessibilityLabel="View best weight trend"
          >
            <Text
              variant="caption"
              weight="bold"
              color={metric === 'WEIGHT' ? theme.colors.text.inverse : theme.colors.text.secondary}
            >
              Weight
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartScroll}>
        <View style={styles.chartArea}>
          {validPoints.map((pt, idx) => {
            const hasVal = pt.value !== null && pt.value !== undefined;
            const normalizedHeight = hasVal ? ((pt.value! - minValue) / range) * (CHART_HEIGHT - 30) + 15 : 0;

            return (
              <View key={`${pt.date}-${idx}`} style={styles.pointColumn}>
                <View style={styles.pointCanvas}>
                  {hasVal && (
                    <View style={[styles.pointMarkerContainer, { bottom: normalizedHeight }]}>
                      <Text variant="caption" weight="bold" color={theme.colors.brand.emerald} style={styles.pointValue}>
                        {pt.value}
                      </Text>
                      <View style={styles.dot} />
                      <View style={styles.guideline} />
                    </View>
                  )}
                </View>

                <Text variant="caption" color={theme.colors.text.muted} numberOfLines={1} style={styles.dateLabel}>
                  {formatCalendarDate(pt.date).slice(0, 6)}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.full,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.radius.full,
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.brand.emerald,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  chartScroll: {
    paddingVertical: theme.spacing.sm,
  },
  chartArea: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  pointColumn: {
    alignItems: 'center',
    width: 48,
    height: '100%',
    justifyContent: 'flex-end',
  },
  pointCanvas: {
    width: '100%',
    height: 140,
    position: 'relative',
    alignItems: 'center',
  },
  pointMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 48,
  },
  pointValue: {
    fontSize: 10,
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.emerald,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaces.card,
  },
  guideline: {
    width: 1,
    height: 140,
    backgroundColor: theme.colors.borders.border,
    position: 'absolute',
    top: 14,
    zIndex: -1,
  },
  dateLabel: {
    fontSize: 10,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
