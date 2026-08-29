import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { registerSchema } from '@gbud/validation';
import { useAuth } from '../../auth/AuthProvider';
import { useNavigation } from '../../navigation/NavigationProvider';
import { theme } from '../../theme/theme';
import {
  Screen,
  Text,
  Input,
  Button,
  ErrorState,
  KeyboardAvoidingContainer,
} from '../../components';

export const RegisterScreen: React.FC = () => {
  const { register, error: apiError, requestId, isLoading, clearError } = useAuth();
  const { navigateAuth } = useNavigation();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleRegister = async () => {
    clearError();
    setValidationErrors({});

    const fieldErrors: {
      email?: string;
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // 1. Password confirmation check
    if (password !== confirmPassword) {
      fieldErrors.confirmPassword = 'Passwords do not match';
    }

    // 2. Schema validation
    const result = registerSchema.safeParse({ email, username, password });
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'username' | 'password';
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(fieldErrors);
      return;
    }

    if (result.success) {
      try {
        await register(result.data);
      } catch {
        // Handled by AuthProvider state
      }
    }
  };

  const handleNavigateToLogin = () => {
    clearError();
    navigateAuth('Login');
  };

  return (
    <Screen padding="lg" testID="register-screen">
      <KeyboardAvoidingContainer contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="hero" weight="heavy" color={theme.colors.brand.emerald} style={styles.brandTitle}>
            GBUD
          </Text>
          <Text variant="heading" weight="bold" style={styles.title}>
            Create Account
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Start tracking your training, nutrition, and progress
          </Text>
        </View>

        {apiError ? (
          <ErrorState
            title="Registration Failed"
            message={apiError}
            requestId={requestId}
            testID="register-api-error"
          />
        ) : null}

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (validationErrors.email) {
                setValidationErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={validationErrors.email}
            testID="register-email-input"
            editable={!isLoading}
          />

          <Input
            label="Username"
            placeholder="e.g. iron_lifter"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (validationErrors.username) {
                setValidationErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
            autoCapitalize="none"
            autoCorrect={false}
            helperText="3–30 characters, letters, numbers, and underscores only"
            error={validationErrors.username}
            testID="register-username-input"
            editable={!isLoading}
          />

          <Input
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (validationErrors.password) {
                setValidationErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            isPassword
            error={validationErrors.password}
            testID="register-password-input"
            editable={!isLoading}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (validationErrors.confirmPassword) {
                setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            isPassword
            error={validationErrors.confirmPassword}
            testID="register-confirm-password-input"
            editable={!isLoading}
          />

          <Button
            label={isLoading ? 'Creating Account...' : 'Create Account'}
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="lg"
            style={styles.submitButton}
            testID="register-submit-button"
          />
        </View>

        <View style={styles.footer}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleNavigateToLogin}
            disabled={isLoading}
            testID="register-switch-to-login"
            accessibilityRole="button"
            accessibilityLabel="Sign in with existing account"
          >
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingContainer>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  brandTitle: {
    letterSpacing: 3,
    marginBottom: theme.spacing.xs,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  form: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
});
