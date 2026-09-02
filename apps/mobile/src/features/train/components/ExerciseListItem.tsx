import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ExerciseDTO } from '../train.types';
import { Text } from '../../../components/common/Text';
import { MuscleGroupBadge } from './MuscleGroupBadge';
import { theme } from '../../../theme/theme';

export interface ExerciseListItemProps {
  exercise: ExerciseDTO;
  onPress?: () => void;
  selected?: boolean;
  testID?: string;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  onPress,
  selected = false,
  testID = 'exercise-list-item',
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.infoArea}>
        <Text variant="heading" style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        {exercise.equipment && (
          <Text variant="muted" style={styles.subtext}>
            {exercise.equipment}
          </Text>
        )}
      </View>
      <MuscleGroupBadge muscleGroup={exercise.muscleGroup} size="sm" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
    marginBottom: theme.spacing.xs,
  },
  containerSelected: {
    borderColor: theme.colors.brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  infoArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
  },
});
