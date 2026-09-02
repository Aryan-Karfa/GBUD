import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WorkoutSessionExerciseDTO, WorkoutSetDTO } from '../train.types';
import { WorkoutSetRow } from './WorkoutSetRow';
import { SetInputRow } from './SetInputRow';
import { Card } from '../../../components/layout/Card';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface WorkoutExerciseRowProps {
  sessionExercise: WorkoutSessionExerciseDTO;
  onAddSet?: (input: { reps?: number; weight?: number }) => Promise<void>;
  onUpdateSet?: (setId: string, input: { reps?: number; weight?: number }) => Promise<void>;
  onDeleteSet?: (setId: string) => Promise<void>;
  readOnly?: boolean;
  isMutating?: boolean;
  testID?: string;
}

export const WorkoutExerciseRow: React.FC<WorkoutExerciseRowProps> = ({
  sessionExercise,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  readOnly = false,
  isMutating = false,
  testID = `workout-exercise-${sessionExercise.id}`,
}) => {
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  const sortedSets = [...(sessionExercise.sets || [])].sort(
    (a, b) => a.setNumber - b.setNumber
  );

  const nextSetNumber = sortedSets.length + 1;

  const handleSaveEdit = async (setId: string, values: { reps?: number; weight?: number }) => {
    if (onUpdateSet) {
      await onUpdateSet(setId, values);
      setEditingSetId(null);
    }
  };

  return (
    <Card style={styles.card} testID={testID}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <View style={styles.orderBadge}>
          <Text variant="caption" style={styles.orderText}>
            #{sessionExercise.order}
          </Text>
        </View>
        <View style={styles.titleContainer}>
          <Text variant="heading" style={styles.exerciseName} numberOfLines={1}>
            {sessionExercise.name}
          </Text>
          {sessionExercise.notes && (
            <Text variant="muted" style={styles.notes} numberOfLines={2}>
              {sessionExercise.notes}
            </Text>
          )}
        </View>
        <View style={styles.setCountBadge}>
          <Text variant="caption" style={styles.setCountText}>
            {sortedSets.length} {sortedSets.length === 1 ? 'set' : 'sets'}
          </Text>
        </View>
      </View>

      {/* Sets List */}
      <View style={styles.setsList}>
        {sortedSets.map((set) => {
          if (editingSetId === set.id && !readOnly) {
            return (
              <SetInputRow
                key={set.id}
                mode="edit"
                setNumber={set.setNumber}
                initialReps={set.reps}
                initialWeight={set.weight}
                onSave={(values) => handleSaveEdit(set.id, values)}
                onCancel={() => setEditingSetId(null)}
                isSubmitting={isMutating}
                testID={`edit-set-${set.id}`}
              />
            );
          }

          return (
            <WorkoutSetRow
              key={set.id}
              set={set}
              readOnly={readOnly}
              onEdit={!readOnly ? () => setEditingSetId(set.id) : undefined}
              onDelete={
                !readOnly && onDeleteSet ? () => onDeleteSet(set.id) : undefined
              }
            />
          );
        })}

        {sortedSets.length === 0 && (
          <View style={styles.noSets}>
            <Text variant="muted" style={styles.noSetsText}>
              No sets recorded yet.
            </Text>
          </View>
        )}
      </View>

      {/* Add New Set Form */}
      {!readOnly && onAddSet && editingSetId === null && (
        <View style={styles.addSetSection}>
          <SetInputRow
            mode="add"
            setNumber={nextSetNumber}
            onSave={onAddSet}
            isSubmitting={isMutating}
            testID={`add-set-to-${sessionExercise.id}`}
          />
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.border,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  orderText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.emerald,
  },
  titleContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  notes: {
    fontSize: 11,
    marginTop: 2,
  },
  setCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.xs,
  },
  setCountText: {
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  setsList: {
    marginTop: theme.spacing.xs,
  },
  noSets: {
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  noSetsText: {
    fontSize: theme.typography.sizes.xs,
  },
  addSetSection: {
    marginTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: theme.spacing.xs,
  },
});
