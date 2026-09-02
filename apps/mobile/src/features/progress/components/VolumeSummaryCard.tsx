import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { VolumeSummaryDTO } from '../progress.types';

export interface VolumeSummaryCardProps {
  volumeSummary: VolumeSummaryDTO | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const VolumeSummaryCard: React.FC<VolumeSummaryCardProps> = ({
  volumeSummary,
  onPress,
  style,
}) => {
  if (!volumeSummary) {
    return (
      <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
        <Text variant="body" color={theme.colors.text.muted} align="center">
          No volume data available for this period.
        </Text>
      </Card>
    );
  }

  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel="Training volume summary"
      style={style}
    >
      <Card elevation="elevation2" style={styles.card}>
        <View style={styles.header}>
          <Text variant="subheading" weight="bold" color={theme.colors.text.primary}>
            Training Volume
          </Text>
          {onPress && (
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
              Breakdown →
            </Text>
          )}
        </View>

        <View style={styles.content}>
          <Text variant="caption" color={theme.colors.text.muted}>
            TOTAL TONNAGE LIFTED
          </Text>
          <View style={styles.valueRow}>
            <Text variant="hero" weight="bold" color={theme.colors.brand.emerald} style={styles.value}>
              {volumeSummary.totalVolume.toLocaleString()}
            </Text>
            <Text variant="heading" color={theme.colors.text.secondary} style={styles.unit}>
              {volumeSummary.unit || 'kg'}
            </Text>
          </View>
        </View>
      </Card>
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  content: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs / 2,
  },
  value: {
    fontSize: 36,
    lineHeight: 44,
  },
  unit: {
    fontSize: 18,
  },
});
