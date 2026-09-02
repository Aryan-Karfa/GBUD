import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MealType } from '../fuel.types';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface MealTypeBadgeProps {
  mealType: MealType | string | null | undefined;
  size?: 'sm' | 'md';
  testID?: string;
}

export const MealTypeBadge: React.FC<MealTypeBadgeProps> = ({
  mealType,
  size = 'md',
  testID = 'meal-type-badge',
}) => {
  const isSm = size === 'sm';
  const typeKey = (mealType || 'OTHER').toUpperCase();

  const getStyleForType = () => {
    switch (typeKey) {
      case 'BREAKFAST':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', color: theme.colors.brand.amber };
      case 'LUNCH':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: theme.colors.brand.emerald };
      case 'DINNER':
        return { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)', color: theme.colors.brand.cyan };
      case 'SNACK':
        return { bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' };
      default:
        return { bg: 'rgba(113, 113, 122, 0.12)', border: 'rgba(113, 113, 122, 0.3)', color: theme.colors.text.secondary };
    }
  };

  const styleConfig = getStyleForType();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: styleConfig.bg, borderColor: styleConfig.border },
        isSm && styles.badgeSm,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          { color: styleConfig.color },
          isSm && styles.textSm,
        ]}
      >
        {typeKey}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9,
  },
});
