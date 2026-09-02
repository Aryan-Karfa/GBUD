import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface FoodTypeBadgeProps {
  isCustom: boolean;
  size?: 'sm' | 'md';
  testID?: string;
}

export const FoodTypeBadge: React.FC<FoodTypeBadgeProps> = ({
  isCustom,
  size = 'md',
  testID = 'food-type-badge',
}) => {
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isCustom ? styles.customBadge : styles.systemBadge,
        isSm && styles.badgeSm,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          isCustom ? styles.customText : styles.systemText,
          isSm && styles.textSm,
        ]}
      >
        {isCustom ? 'CUSTOM' : 'SYSTEM'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.xs,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  systemBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  customBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  text: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9,
  },
  systemText: {
    color: theme.colors.brand.emerald,
  },
  customText: {
    color: theme.colors.brand.amber,
  },
});
