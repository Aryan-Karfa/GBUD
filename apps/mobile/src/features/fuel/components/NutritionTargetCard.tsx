import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NutritionTargetDTO } from '../fuel.types';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface NutritionTargetCardProps {
  target: NutritionTargetDTO;
  isEffective?: boolean;
  onPress?: () => void;
  testID?: string;
}

export const NutritionTargetCard: React.FC<NutritionTargetCardProps> = ({
  target,
  isEffective = false,
  onPress,
  testID = 'nutrition-target-card',
}) => {
  return (
    <Card onPress={onPress} style={styles.card} testID={testID}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text variant="caption" style={styles.effectiveLabel}>
            EFFECTIVE FROM
          </Text>
          <Text variant="heading" style={styles.effectiveDate}>
            {target.effectiveFrom}
          </Text>
        </View>

        {isEffective && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE TARGET</Text>
          </View>
        )}
      </View>

      {/* Target Macros Grid */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Text variant="caption" style={styles.gridLabel}>
            CALORIES
          </Text>
          <Text variant="body" style={styles.gridCalorieValue}>
            {Math.round(target.calories)} kcal
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text variant="caption" style={styles.gridLabel}>
            PROTEIN
          </Text>
          <Text variant="body" style={styles.gridValue}>
            {Math.round(target.protein)}g
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text variant="caption" style={styles.gridLabel}>
            CARBS
          </Text>
          <Text variant="body" style={styles.gridValue}>
            {Math.round(target.carbohydrates)}g
          </Text>
        </View>

        <View style={styles.gridItem}>
          <Text variant="caption" style={styles.gridLabel}>
            FAT
          </Text>
          <Text variant="body" style={styles.gridValue}>
            {Math.round(target.fat)}g
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleArea: {
    flex: 1,
  },
  effectiveLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    letterSpacing: 0.5,
  },
  effectiveDate: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.xs,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.emerald,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridItem: {
    alignItems: 'flex-start',
  },
  gridLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  gridCalorieValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  gridValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
});
