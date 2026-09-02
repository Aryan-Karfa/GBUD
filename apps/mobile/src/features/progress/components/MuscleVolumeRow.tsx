import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { MuscleGroupVolumeItemDTO } from '../progress.types';

export interface MuscleVolumeRowProps {
  item: MuscleGroupVolumeItemDTO;
  maxVolume: number;
  style?: StyleProp<ViewStyle>;
}

export const MuscleVolumeRow: React.FC<MuscleVolumeRowProps> = ({
  item,
  maxVolume,
  style,
}) => {
  const percentage = maxVolume > 0 ? Math.min(100, Math.max(0, (item.totalVolume / maxVolume) * 100)) : 0;
  const displayName = item.muscleGroup || 'UNKNOWN';

  return (
    <View
      accessibilityLabel={`Muscle group ${displayName} volume ${item.totalVolume.toLocaleString()} kilograms`}
      style={[styles.container, style]}
    >
      <View style={styles.textRow}>
        <Text variant="body" weight="bold" color={theme.colors.text.primary} style={styles.muscleName}>
          {displayName.toUpperCase()}
        </Text>
        <Text variant="body" weight="bold" color={theme.colors.text.primary}>
          {item.totalVolume.toLocaleString()} <Text variant="caption" color={theme.colors.text.muted}>kg</Text>
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  muscleName: {
    letterSpacing: 0.5,
  },
  track: {
    height: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.cyan,
  },
});
