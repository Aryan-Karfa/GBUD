import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, Button } from '../../../components';
import { theme } from '../../../theme/theme';

export interface HomeErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const HomeErrorState: React.FC<HomeErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'A connection error occurred while loading this section.',
  onRetry,
  style,
  testID = 'home-error-state',
}) => {
  return (
    <Card elevation="elevation2" style={[styles.card, style as ViewStyle]} testID={testID}>
      <Text variant="subheading" weight="bold" color={theme.colors.status.error} style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" color={theme.colors.text.secondary} align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button
          label="Retry"
          variant="secondary"
          size="sm"
          onPress={onRetry}
          style={styles.retryButton}
          testID="home-error-retry-btn"
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  message: {
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  retryButton: {
    minWidth: 90,
  },
});
