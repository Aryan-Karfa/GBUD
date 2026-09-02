import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { FoodDTO } from '../fuel.types';
import { FoodTypeBadge } from './FoodTypeBadge';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface FoodListItemProps {
  food: FoodDTO;
  onPress: () => void;
  selected?: boolean;
  testID?: string;
}

export const FoodListItem: React.FC<FoodListItemProps> = ({
  food,
  onPress,
  selected = false,
  testID = 'food-list-item',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, selected && styles.containerSelected]}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.left}>
        <Text variant="heading" style={styles.name} numberOfLines={1}>
          {food.name}
        </Text>
        <Text variant="caption" style={styles.subtext}>
          {food.servingSize} {food.servingUnit} • {Math.round(food.calories)} kcal • P: {Math.round(food.protein)}g C: {Math.round(food.carbohydrates)}g F: {Math.round(food.fat)}g
        </Text>
      </View>

      <FoodTypeBadge isCustom={food.isCustom} size="sm" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
    marginBottom: 6,
  },
  containerSelected: {
    borderColor: theme.colors.brand.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  left: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
    color: theme.colors.text.secondary,
  },
});
