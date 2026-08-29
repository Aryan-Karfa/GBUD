import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';
import { Text } from '../common/Text';
import { Button } from '../common/Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  emoji = '📋',
  actionLabel,
  onAction,
  style,
  testID = 'empty-state',
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text variant="subheading" weight="semibold" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" color={theme.colors.text.secondary} align="center" style={styles.description}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          fullWidth={false}
          style={styles.actionButton}
          testID={`${testID}-action`}
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
    borderColor: theme.colors.borders.border,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  emoji: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    maxWidth: 260,
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.xl,
  },
});
