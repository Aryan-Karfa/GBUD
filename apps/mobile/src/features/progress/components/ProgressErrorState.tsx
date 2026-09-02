import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';

export interface ProgressErrorStateProps {
  error?: string | null;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ProgressErrorState: React.FC<ProgressErrorStateProps> = ({
  error,
  onRetry,
  style,
}) => {
  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]}>
      <Text variant="subheading" weight="bold" color={theme.colors.status.error} style={styles.title}>
        Analytics Unavailable
      </Text>
      <Text variant="body" color={theme.colors.text.secondary} align="center" style={styles.message}>
        {error || 'Unable to load progress data. Please verify your network connection and try again.'}
      </Text>
      {onRetry && (
        <Button
          label="Retry"
          onPress={onRetry}
          variant="secondary"
          size="sm"
          style={styles.retryButton}
          testID="progress-error-retry"
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  message: {
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 100,
  },
});
