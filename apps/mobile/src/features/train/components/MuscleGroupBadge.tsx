import React from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { theme } from '../../../theme/theme';

export interface MuscleGroupBadgeProps {
  muscleGroup?: string | null;
  size?: 'sm' | 'md';
}

const MUSCLE_COLORS: Record<string, { bg: string; text: string }> = {
  CHEST: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
  BACK: { bg: 'rgba(6, 182, 212, 0.15)', text: '#06b6d4' },
  LEGS: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
  SHOULDERS: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
  ARMS: { bg: 'rgba(236, 72, 153, 0.15)', text: '#ec4899' },
  CORE: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  DEFAULT: { bg: 'rgba(161, 161, 170, 0.15)', text: '#a1a1aa' },
};

export const MuscleGroupBadge: React.FC<MuscleGroupBadgeProps> = ({
  muscleGroup,
  size = 'md',
}) => {
  if (!muscleGroup) {
    return null;
  }

  const normalized = muscleGroup.trim().toUpperCase();
  const colorScheme = MUSCLE_COLORS[normalized] || MUSCLE_COLORS.DEFAULT;

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorScheme.bg },
        isSmall && styles.badgeSmall,
      ]}
      testID="muscle-group-badge"
    >
      <RNText
        style={[
          styles.label,
          { color: colorScheme.text },
          isSmall && styles.labelSmall,
        ]}
      >
        {muscleGroup.toUpperCase()}
      </RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 10,
  },
});
