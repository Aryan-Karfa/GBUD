import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { Text } from '../common/Text';
import { Button } from '../common/Button';

export interface ErrorStateProps {
  message: string;
  title?: string;
  requestId?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  title = 'Something went wrong',
  requestId,
  onRetry,
  retryLabel = 'Retry',
  style,
  testID = 'error-state',
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.badge}>
        <Text variant="body" color={theme.colors.status.error} weight="bold">
          !
        </Text>
      </View>

      <Text variant="subheading" weight="semibold" align="center" style={styles.title}>
        {title}
      </Text>

      <Text variant="caption" color={theme.colors.text.secondary} align="center" style={styles.message}>
        {message}
      </Text>

      {requestId ? (
        <Text variant="muted" style={styles.requestId}>
          Request ID: {requestId}
        </Text>
      ) : null}

      {onRetry ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="outline"
          size="sm"
          fullWidth={false}
          style={styles.retryButton}
          testID={`${testID}-retry`}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.status.error,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.status.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  message: {
    marginBottom: theme.spacing.sm,
  },
  requestId: {
    fontSize: 11,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  retryButton: {
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xl,
  },
});
