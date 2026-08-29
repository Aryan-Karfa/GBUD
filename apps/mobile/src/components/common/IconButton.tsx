import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Text } from './Text';

export interface IconButtonProps {
  icon?: React.ReactNode;
  emoji?: string;
  onPress: (event: GestureResponderEvent) => void;
  size?: number;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  emoji,
  onPress,
  size = 40,
  accessibilityLabel,
  disabled = false,
  style,
  testID,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? icon : emoji ? <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaces.cardHover,
  },
  disabled: {
    opacity: 0.5,
  },
});
