import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MealFoodEntryDTO } from '../fuel.types';
import { Text } from '../../../components/common/Text';
import { theme } from '../../../theme/theme';

export interface MealFoodRowProps {
  entry: MealFoodEntryDTO;
  onEditQuantity?: (entry: MealFoodEntryDTO) => void;
  onRemove?: (entryId: string) => void;
  readOnly?: boolean;
  testID?: string;
}

export const MealFoodRow: React.FC<MealFoodRowProps> = ({
  entry,
  onEditQuantity,
  onRemove,
  readOnly = false,
  testID = `meal-food-${entry.id}`,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      {/* Top Header: Snapshot Name & Action Controls */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text variant="heading" style={styles.name} numberOfLines={1}>
            {entry.foodNameSnapshot}
          </Text>
          <Text variant="caption" style={styles.quantitySubtitle}>
            {entry.quantity} {entry.unit}
          </Text>
        </View>

        {!readOnly && (
          <View style={styles.actions}>
            {onEditQuantity && (
              <TouchableOpacity
                onPress={() => onEditQuantity(entry)}
                style={styles.actionBtn}
                accessibilityRole="button"
                accessibilityLabel={`Edit quantity for ${entry.foodNameSnapshot}`}
                testID={`${testID}-edit-btn`}
              >
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
            )}

            {onRemove && (
              <TouchableOpacity
                onPress={() => onRemove(entry.id)}
                style={styles.removeBtn}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${entry.foodNameSnapshot} from meal`}
                testID={`${testID}-remove-btn`}
              >
                <Text style={styles.removeIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Snapshot Nutrition Values */}
      <View style={styles.snapshotsRow}>
        <Text variant="caption" style={styles.calorieText}>
          {Math.round(entry.caloriesSnapshot)} kcal
        </Text>
        <Text variant="caption" style={styles.dot}>
          •
        </Text>
        <Text variant="caption" style={styles.macroText}>
          P: {Math.round(entry.proteinSnapshot)}g
        </Text>
        <Text variant="caption" style={styles.dot}>
          •
        </Text>
        <Text variant="caption" style={styles.macroText}>
          C: {Math.round(entry.carbohydratesSnapshot)}g
        </Text>
        <Text variant="caption" style={styles.dot}>
          •
        </Text>
        <Text variant="caption" style={styles.macroText}>
          F: {Math.round(entry.fatSnapshot)}g
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
  },
  quantitySubtitle: {
    fontSize: 11,
    color: theme.colors.brand.amber,
    marginTop: 2,
    fontWeight: theme.typography.weights.medium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 11,
    color: theme.colors.status.error,
    fontWeight: theme.typography.weights.bold,
  },
  snapshotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  calorieText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  dot: {
    marginHorizontal: 5,
    color: theme.colors.text.muted,
    fontSize: 10,
  },
  macroText: {
    fontSize: 11,
    color: theme.colors.text.secondary,
  },
});
