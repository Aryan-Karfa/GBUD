import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Text } from '../common/Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  helperText?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  inputStyle?: TextStyle | TextStyle[];
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  isPassword = false,
  containerStyle,
  inputStyle,
  testID,
  secureTextEntry,
  onFocus,
  onBlur,
  editable = true,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!isPassword);

  const shouldHideText = isPassword ? !isPasswordVisible : !!secureTextEntry;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text variant="caption" weight="medium" color={theme.colors.text.secondary} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={theme.colors.text.muted}
          secureTextEntry={shouldHideText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          testID={testID}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID={testID ? `${testID}-toggle-visibility` : 'input-toggle-visibility'}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            <Text variant="caption" weight="semibold" color={theme.colors.text.secondary}>
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text variant="error" style={styles.errorText} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="muted" style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.borders.border,
    borderRadius: theme.radius.md,
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
  },
  inputFocused: {
    borderColor: theme.colors.borders.borderFocus,
  },
  inputError: {
    borderColor: theme.colors.status.error,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.md,
    paddingVertical: theme.spacing.sm,
  },
  visibilityToggle: {
    paddingLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: theme.spacing.xs,
  },
  helperText: {
    marginTop: theme.spacing.xs,
  },
});
