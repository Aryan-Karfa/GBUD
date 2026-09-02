import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../../../components';
import { theme } from '../../../theme/theme';

export interface HomeSectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: object;
}

export const HomeSectionHeader: React.FC<HomeSectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text variant="subheading" weight="bold" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color={theme.colors.text.secondary}>
            {subtitle}
          </Text>
        )}
      </View>
      {actionLabel && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.actionButton}
        >
          <Text variant="caption" weight="bold" color={theme.colors.brand.emerald}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
});
