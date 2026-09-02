import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from '../../../components';
import { theme } from '../../../theme/theme';
import { ExerciseVolumeItemDTO } from '../progress.types';

export interface ExerciseVolumeRowProps {
  item: ExerciseVolumeItemDTO;
  maxVolume: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ExerciseVolumeRow: React.FC<ExerciseVolumeRowProps> = ({
  item,
  maxVolume,
  onPress,
  style,
}) => {
  const percentage = maxVolume > 0 ? Math.min(100, Math.max(0, (item.totalVolume / maxVolume) * 100)) : 0;
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Exercise ${item.exerciseName} volume ${item.totalVolume.toLocaleString()} kilograms`}
      style={[styles.container, style]}
    >
      <View style={styles.textRow}>
        <Text variant="body" weight="medium" color={theme.colors.text.primary} numberOfLines={1} style={styles.name}>
          {item.exerciseName}
        </Text>
        <Text variant="body" weight="bold" color={theme.colors.text.primary}>
          {item.totalVolume.toLocaleString()} <Text variant="caption" color={theme.colors.text.muted}>kg</Text>
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </Container>
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
  name: {
    flex: 1,
    paddingRight: theme.spacing.md,
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
    backgroundColor: theme.colors.brand.emerald,
  },
});
