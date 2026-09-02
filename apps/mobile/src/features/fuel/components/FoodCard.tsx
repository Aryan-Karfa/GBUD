import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FoodDTO } from '../fuel.types';
import { FoodTypeBadge } from './FoodTypeBadge';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface FoodCardProps {
  food: FoodDTO;
  onPress?: () => void;
  selected?: boolean;
  testID?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onPress,
  selected = false,
  testID = 'food-card',
}) => {
  return (
    <Card
      onPress={onPress}
      style={[styles.card, selected ? styles.cardSelected : {}]}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text variant="heading" style={styles.title} numberOfLines={1}>
            {food.name}
          </Text>
          <Text variant="muted" style={styles.servingInfo}>
            {food.servingSize} {food.servingUnit}
          </Text>
        </View>
        <FoodTypeBadge isCustom={food.isCustom} size="sm" />
      </View>

      {food.description && (
        <Text variant="body" numberOfLines={2} style={styles.description}>
          {food.description}
        </Text>
      )}

      {/* Macros Row */}
      <View style={styles.macrosRow}>
        <View style={styles.macroItem}>
          <Text variant="caption" style={styles.macroLabel}>
            CALORIES
          </Text>
          <Text variant="body" style={styles.calorieValue}>
            {Math.round(food.calories)} kcal
          </Text>
        </View>

        <View style={styles.macroItem}>
          <Text variant="caption" style={styles.macroLabel}>
            PROTEIN
          </Text>
          <Text variant="body" style={styles.macroValue}>
            {Math.round(food.protein)}g
          </Text>
        </View>

        <View style={styles.macroItem}>
          <Text variant="caption" style={styles.macroLabel}>
            CARBS
          </Text>
          <Text variant="body" style={styles.macroValue}>
            {Math.round(food.carbohydrates)}g
          </Text>
        </View>

        <View style={styles.macroItem}>
          <Text variant="caption" style={styles.macroLabel}>
            FAT
          </Text>
          <Text variant="body" style={styles.macroValue}>
            {Math.round(food.fat)}g
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  cardSelected: {
    borderColor: theme.colors.brand.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  titleArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  servingInfo: {
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  macroItem: {
    alignItems: 'flex-start',
  },
  macroLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  calorieValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  macroValue: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
});
