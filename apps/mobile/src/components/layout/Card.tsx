import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../../theme/theme';

export interface CardProps {
  children?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle | ViewStyle[];
  padding?: keyof typeof theme.spacing | number;
  elevation?: keyof typeof theme.shadows;
  bordered?: boolean;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  padding = 'md',
  elevation = 'elevation2',
  bordered = true,
  testID,
}) => {
  const paddingValue =
    typeof padding === 'number' ? padding : theme.spacing[padding] ?? theme.spacing.md;

  const cardStyles = [
    styles.card,
    theme.shadows[elevation],
    bordered && styles.bordered,
    { padding: paddingValue },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={cardStyles}
        testID={testID}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
  },
});
