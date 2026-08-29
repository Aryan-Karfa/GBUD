import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { loginSchema } from '@gbud/validation';
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

export const LoginScreen: React.FC = () => {
  const { login, error: apiError, requestId, isLoading, clearError } = useAuth();
  const { navigateAuth } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = async () => {
    clearError();
    setValidationErrors({});

    // Client-side schema validation
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as 'email' | 'password';
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setValidationErrors(fieldErrors);
      return;
    }

    try {
      await login(result.data);
    } catch {
      // Handled by AuthProvider state
    }
  };

  const handleNavigateToRegister = () => {
    clearError();
    navigateAuth('Register');
  };

  return (
    <Screen padding="lg" testID="login-screen">
      <KeyboardAvoidingContainer contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="hero" weight="heavy" color={theme.colors.brand.emerald} style={styles.brandTitle}>
            GBUD
          </Text>
          <Text variant="heading" weight="bold" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="caption" color={theme.colors.text.secondary}>
            Sign in to access your workouts, nutrition, and progress
          </Text>
        </View>

        {apiError ? (
          <ErrorState
            title="Authentication Failed"
            message={apiError}
            requestId={requestId}
            testID="login-api-error"
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
            testID="login-email-input"
            editable={!isLoading}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (validationErrors.password) {
                setValidationErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            isPassword
            error={validationErrors.password}
            testID="login-password-input"
            editable={!isLoading}
          />

          <Button
            label={isLoading ? 'Signing In...' : 'Sign In'}
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="lg"
            style={styles.submitButton}
            testID="login-submit-button"
          />
        </View>

        <View style={styles.footer}>
          <Text variant="caption" color={theme.colors.text.muted}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={handleNavigateToRegister}
            disabled={isLoading}
            testID="login-switch-to-register"
            accessibilityRole="button"
            accessibilityLabel="Sign up for a new account"
          >
            <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
              Create Account
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
