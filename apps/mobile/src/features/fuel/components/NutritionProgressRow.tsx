import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface NutritionProgressRowProps {
  label: string;
  actual: number;
  target?: number | null;
  unit: string;
  accentColor?: string;
  testID?: string;
}

export const NutritionProgressRow: React.FC<NutritionProgressRowProps> = ({
  label,
  actual,
  target,
  unit,
  accentColor = theme.colors.brand.amber,
  testID = 'nutrition-progress-row',
}) => {
  const roundedActual = Math.round(actual);
  const roundedTarget = target !== null && target !== undefined ? Math.round(target) : null;

  let percent = 0;
  if (roundedTarget && roundedTarget > 0) {
    percent = Math.min(100, Math.max(0, (roundedActual / roundedTarget) * 100));
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Metric Header */}
      <View style={styles.header}>
        <Text variant="caption" style={styles.label}>
          {label}
        </Text>
        <Text variant="body" style={styles.values}>
          {roundedActual} {unit}
          {roundedTarget !== null ? (
            <Text variant="muted" style={styles.targetText}>
              {' '}/ {roundedTarget} {unit}
            </Text>
          ) : null}
        </Text>
      </View>

      {/* Progress Track */}
      {roundedTarget !== null ? (
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${percent}%`,
                backgroundColor: accentColor,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  values: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  targetText: {
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
