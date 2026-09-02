import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ExerciseDTO } from '../train.types';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { MuscleGroupBadge } from './MuscleGroupBadge';
import { theme } from '../../../theme/theme';

export interface ExerciseCardProps {
  exercise: ExerciseDTO;
  onPress?: () => void;
  selected?: boolean;
  testID?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  selected = false,
  testID = 'exercise-card',
}) => {
  return (
    <Card
      onPress={onPress}
      style={[styles.card, selected ? styles.cardSelected : {}]}
      testID={testID}
    >
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text variant="heading" style={styles.title} numberOfLines={1}>
            {exercise.name}
          </Text>
          {exercise.equipment && (
            <Text variant="muted" style={styles.equipment}>
              {exercise.equipment}
            </Text>
          )}
        </View>
        <MuscleGroupBadge muscleGroup={exercise.muscleGroup} size="sm" />
      </View>

      {exercise.description && (
        <Text variant="body" numberOfLines={2} style={styles.description}>
          {exercise.description}
        </Text>
      )}

      {exercise.movementPattern && (
        <View style={styles.footer}>
          <Text variant="caption" style={styles.movementPattern}>
            Pattern: {exercise.movementPattern}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  cardSelected: {
    borderColor: theme.colors.brand.emerald,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  titleArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  equipment: {
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    lineHeight: 18,
  },
  footer: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementPattern: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.muted,
  },
});
