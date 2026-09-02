import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';

export interface ProgressMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressMetricCard: React.FC<ProgressMetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  accentColor = theme.colors.brand.emerald,
  style,
}) => {
  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
      <View style={styles.header}>
        <View style={[styles.accentIndicator, { backgroundColor: accentColor }]} />
        <Text variant="caption" weight="bold" color={theme.colors.text.muted} style={styles.label}>
          {label.toUpperCase()}
        </Text>
      </View>

      <View style={styles.valueRow}>
        <Text variant="heading" weight="bold" color={theme.colors.text.primary} style={styles.value}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        {unit && (
          <Text variant="body" color={theme.colors.text.secondary} style={styles.unit}>
            {unit}
          </Text>
        )}
      </View>

      {subtext && (
        <Text variant="caption" color={theme.colors.text.muted} style={styles.subtext}>
          {subtext}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  accentIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  label: {
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs / 2,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
  },
  unit: {
    fontSize: 14,
  },
  subtext: {
    marginTop: theme.spacing.xs / 2,
  },
});
