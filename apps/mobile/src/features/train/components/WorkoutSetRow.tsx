import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { WorkoutSetDTO } from '../train.types';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface WorkoutSetRowProps {
  set: WorkoutSetDTO;
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
  testID?: string;
}

export const WorkoutSetRow: React.FC<WorkoutSetRowProps> = ({
  set,
  onEdit,
  onDelete,
  readOnly = false,
  testID = `workout-set-row-${set.id}`,
}) => {
  const repsText = set.reps !== null && set.reps !== undefined ? `${set.reps} reps` : '—';
  const weightText = set.weight !== null && set.weight !== undefined ? `${set.weight} kg` : '—';

  return (
    <View style={styles.container} testID={testID}>
      {/* Set Number */}
      <View style={styles.badge}>
        <Text variant="caption" style={styles.badgeText}>
          {set.setNumber}
        </Text>
      </View>

      {/* Metrics */}
      <View style={styles.metricColumn}>
        <Text variant="body" style={styles.metricValue}>
          {weightText}
        </Text>
        <Text variant="caption" style={styles.metricLabel}>
          WEIGHT
        </Text>
      </View>

      <View style={styles.metricColumn}>
        <Text variant="body" style={styles.metricValue}>
          {repsText}
        </Text>
        <Text variant="caption" style={styles.metricLabel}>
          REPS
        </Text>
      </View>

      {/* Action Buttons (if active workout) */}
      {!readOnly && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-edit-btn`}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.actionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID={`${testID}-delete-btn`}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  metricColumn: {
    flex: 1,
  },
  metricValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  metricLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionBtn: {
    padding: 4,
  },
  editIcon: {
    fontSize: 14,
  },
  deleteIcon: {
    fontSize: 14,
  },
});
