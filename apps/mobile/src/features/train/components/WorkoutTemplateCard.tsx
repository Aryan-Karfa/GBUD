import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WorkoutTemplateDTO } from '../train.types';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { Button } from '../../../components/common/Button';
import { theme } from '../../../theme/theme';

export interface WorkoutTemplateCardProps {
  template: WorkoutTemplateDTO;
  onPress?: () => void;
  onStartWorkout?: () => void;
  isStarting?: boolean;
  testID?: string;
}

export const WorkoutTemplateCard: React.FC<WorkoutTemplateCardProps> = ({
  template,
  onPress,
  onStartWorkout,
  isStarting = false,
  testID = 'workout-template-card',
}) => {
  const exerciseCount = template.exercises?.length ?? 0;

  return (
    <Card onPress={onPress} style={styles.card} testID={testID}>
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text variant="heading" style={styles.title} numberOfLines={1}>
            {template.name}
          </Text>
          <Text variant="muted" style={styles.exerciseCount}>
            {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>
      </View>

      {template.description ? (
        <Text variant="body" numberOfLines={2} style={styles.description}>
          {template.description}
        </Text>
      ) : null}

      {/* Exercise Preview Names */}
      {exerciseCount > 0 && (
        <View style={styles.exercisePreview}>
          <Text variant="caption" numberOfLines={1} style={styles.previewText}>
            {template.exercises
              .slice(0, 3)
              .map((e) => e.exercise?.name || 'Exercise')
              .join(' • ')}
            {exerciseCount > 3 ? ` • +${exerciseCount - 3} more` : ''}
          </Text>
        </View>
      )}

      {/* Quick Start Action */}
      {onStartWorkout && (
        <View style={styles.actionRow}>
          <Button
            variant="primary"
            size="sm"
            label="Start Workout"
            fullWidth={false}
            onPress={onStartWorkout}
            isLoading={isStarting}
            testID={`${testID}-start-btn`}
          />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  exerciseCount: {
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
    color: theme.colors.brand.emerald,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  exercisePreview: {
    marginTop: theme.spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: theme.radius.xs,
  },
  previewText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.muted,
  },
  actionRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
