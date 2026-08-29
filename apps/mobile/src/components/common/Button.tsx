import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = true,
  style,
  labelStyle,
  testID,
}) => {
  const isInteractive = !disabled && !isLoading;

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textColor = disabled
    ? theme.colors.text.muted
    : variantTextColors[variant] || theme.colors.text.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      style={containerStyle}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator
          size={size === 'sm' ? 'small' : 'small'}
          color={textColor}
        />
      ) : (
        <Text
          variant={size === 'sm' ? 'caption' : size === 'lg' ? 'heading' : 'body'}
          weight="semibold"
          color={textColor}
          align="center"
          style={labelStyle}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const variantTextColors: Record<ButtonVariant, string> = {
  primary: theme.colors.text.inverse,
  secondary: theme.colors.text.primary,
  outline: theme.colors.brand.emerald,
  ghost: theme.colors.text.primary,
  danger: '#ffffff',
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  size_sm: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  size_lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  variant_primary: {
    backgroundColor: theme.colors.brand.emerald,
  },
  variant_secondary: {
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.brand.emerald,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: theme.colors.status.error,
  },
  disabled: {
    opacity: 0.5,
  },
});
