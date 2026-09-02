import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FoodDTO } from '../fuel.types';
import { useFoods } from '../hooks/useFoods';
import { FoodListItem } from './FoodListItem';
import { Text } from '../../../components/common/Text';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { theme } from '../../../theme/theme';

export interface FoodPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodDTO, quantity: number) => Promise<void> | void;
  isSubmitting?: boolean;
  testID?: string;
}

export const FoodPicker: React.FC<FoodPickerProps> = ({
  visible,
  onClose,
  onSelectFood,
  isSubmitting = false,
  testID = 'food-picker-modal',
}) => {
  const { foods, isLoading, search, setSearch, filter, setFilter } = useFoods();
  const [selectedFood, setSelectedFood] = useState<FoodDTO | null>(null);
  const [quantityStr, setQuantityStr] = useState<string>('1');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const handlePickFood = (food: FoodDTO) => {
    setSelectedFood(food);
    setQuantityStr(String(food.servingSize || 1));
    setQuantityError(null);
  };

  const handleConfirm = async () => {
    if (!selectedFood) return;
    const parsed = parseFloat(quantityStr.trim());
    if (isNaN(parsed) || parsed <= 0) {
      setQuantityError('Quantity must be a positive number');
      return;
    }

    try {
      await onSelectFood(selectedFood, parsed);
      setSelectedFood(null);
      onClose();
    } catch (err: any) {
      setQuantityError(err.message || 'Failed to add food');
    }
  };

  const handleModalClose = () => {
    setSelectedFood(null);
    setQuantityError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleModalClose}
      testID={testID}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" style={styles.title}>
            {selectedFood ? 'Specify Quantity' : 'Add Food to Meal'}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            label="Close"
            fullWidth={false}
            onPress={handleModalClose}
            disabled={isSubmitting}
            testID="picker-close-btn"
          />
        </View>

        {selectedFood ? (
          /* Step 2: Input Quantity */
          <View style={styles.quantityStep}>
            <View style={styles.selectedSummary}>
              <Text variant="heading" style={styles.selectedName}>
                {selectedFood.name}
              </Text>
              <Text variant="caption" style={styles.selectedMeta}>
                Base Serving: {selectedFood.servingSize} {selectedFood.servingUnit} • {Math.round(selectedFood.calories)} kcal
              </Text>
            </View>

            <Input
              label={`Quantity to add (${selectedFood.servingUnit})`}
              value={quantityStr}
              onChangeText={(text) => {
                setQuantityStr(text);
                if (quantityError) setQuantityError(null);
              }}
              keyboardType="decimal-pad"
              error={quantityError}
              testID="picker-quantity-input"
            />

            <View style={styles.stepActions}>
              <Button
                variant="outline"
                size="md"
                label="← Choose Different Food"
                onPress={() => setSelectedFood(null)}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
              <Button
                variant="primary"
                size="md"
                label="Add to Meal"
                onPress={handleConfirm}
                isLoading={isSubmitting}
                style={{ flex: 1 }}
                testID="picker-confirm-btn"
              />
            </View>
          </View>
        ) : (
          /* Step 1: Search and Select Food */
          <View style={styles.searchStep}>
            <View style={styles.searchContainer}>
              <Input
                value={search}
                onChangeText={setSearch}
                placeholder="Search food catalog..."
                autoCapitalize="none"
                testID="picker-search-input"
              />
            </View>

            {/* Filter Toggle */}
            <View style={styles.filterRow}>
              {(['ALL', 'SYSTEM', 'CUSTOM'] as const).map((f) => {
                const isSelected = filter === f;
                return (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFilter(f)}
                    style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                    testID={`picker-filter-${f.toLowerCase()}`}
                  >
                    <Text style={[styles.filterText, isSelected && styles.filterTextSelected]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* List */}
            {isLoading ? (
              <View style={styles.center}>
                <LoadingIndicator />
                <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
                  Loading foods...
                </Text>
              </View>
            ) : foods.length === 0 ? (
              <View style={styles.center}>
                <Text variant="muted">No foods found matching query.</Text>
              </View>
            ) : (
              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {foods.map((food) => (
                  <FoodListItem
                    key={food.id}
                    food={food}
                    onPress={() => handlePickFood(food)}
                    testID={`picker-item-${food.id}`}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borders.border,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  quantityStep: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  selectedSummary: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaces.card,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
  },
  selectedName: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  selectedMeta: {
    fontSize: 11,
    color: theme.colors.brand.amber,
    marginTop: 2,
  },
  stepActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  searchStep: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaces.card,
    borderWidth: 1,
    borderColor: theme.colors.surfaces.cardBorder,
  },
  filterChipSelected: {
    borderColor: theme.colors.brand.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  filterText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  filterTextSelected: {
    color: theme.colors.brand.amber,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.xxxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
});
