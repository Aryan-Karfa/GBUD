import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import {
  MealTypeBadge,
  MealFoodRow,
  FoodPicker,
  FoodQuantityInput,
  FuelErrorState,
} from '../components';
import { useMeals } from '../hooks/useMeals';
import { MealDTO, MealFoodEntryDTO, FoodDTO, formatCalendarDate } from '../fuel.types';
import { theme } from '../../../theme/theme';

export interface MealDetailScreenProps {
  mealId: string;
}

export const MealDetailScreen: React.FC<MealDetailScreenProps> = ({ mealId }) => {
  const { navigateFuel, goBack } = useNavigation();
  const {
    getMealById,
    deleteMeal,
    addFoodEntry,
    updateFoodEntryQuantity,
    removeFoodEntry,
    isMutating,
  } = useMeals({ autoFetch: false });

  const [meal, setMeal] = useState<MealDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<MealFoodEntryDTO | null>(null);
  const [confirmDeleteMealVisible, setConfirmDeleteMealVisible] = useState<boolean>(false);
  const [entryToRemove, setEntryToRemove] = useState<string | null>(null);

  const loadMeal = async () => {
    setIsLoading(true);
    setError(null);
    const res = await getMealById(mealId);
    if (res) {
      setMeal(res);
    } else {
      setError('Meal not found');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMeal();
  }, [mealId]);

  // Food addition via FoodPicker
  const handleAddFood = async (food: FoodDTO, quantity: number) => {
    try {
      const updated = await addFoodEntry(mealId, {
        foodId: food.id,
        quantity,
        unit: food.servingUnit,
      });
      // Authoritative update directly from backend response
      setMeal(updated);
      setPickerVisible(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add food to meal');
    }
  };

  // Food quantity edit via FoodQuantityInput
  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!editingEntry) return;
    try {
      const updated = await updateFoodEntryQuantity(mealId, editingEntry.id, {
        quantity: newQuantity,
      });
      // Authoritative update directly from backend response
      setMeal(updated);
      setEditingEntry(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update food quantity');
    }
  };

  // Food removal
  const handleConfirmRemoveEntry = async () => {
    if (!entryToRemove) return;
    try {
      const updated = await removeFoodEntry(mealId, entryToRemove);
      // Authoritative update directly from backend response
      setMeal(updated);
      setEntryToRemove(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove food from meal');
    }
  };

  // Meal deletion
  const handleDeleteMeal = async () => {
    try {
      await deleteMeal(mealId);
      setConfirmDeleteMealVisible(false);
      goBack();
    } catch (err: any) {
      setError(err.message || 'Failed to delete meal');
    }
  };

  return (
    <Screen padding="md" testID="meal-detail-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
            testID="meal-detail-back-btn"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text variant="title" style={styles.headerTitle}>
            Meal Details
          </Text>
        </View>

        <Button
          variant="outline"
          size="sm"
          label="Edit"
          fullWidth={false}
          onPress={() => navigateFuel('MealEditor', { mealId })}
          testID="edit-meal-btn"
        />
      </View>

      {error && (
        <FuelErrorState
          error={error}
          onRetry={loadMeal}
          testID="meal-detail-error"
        />
      )}

      {isLoading ? (
        <View style={styles.center}>
          <LoadingIndicator />
          <Text variant="caption" color={theme.colors.text.muted} style={{ marginTop: 8 }}>
            Loading meal details...
          </Text>
        </View>
      ) : !meal ? (
        <View style={styles.center}>
          <Text variant="muted">Meal not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Info Card */}
          <Card style={styles.mainCard}>
            <View style={styles.cardTop}>
              <View style={styles.titleArea}>
                <Text variant="heading" style={styles.mealName}>
                  {meal.name}
                </Text>
                <Text variant="muted" style={styles.mealDate}>
                  {formatCalendarDate(meal.mealDate)}
                </Text>
              </View>
              <MealTypeBadge mealType={meal.mealType} />
            </View>

            {/* Authoritative Totals */}
            <View style={styles.totalsGrid}>
              <View style={styles.totalBox}>
                <Text variant="caption" style={styles.totalLabel}>
                  CALORIES
                </Text>
                <Text variant="body" style={styles.calText}>
                  {Math.round(meal.totalCalories)} kcal
                </Text>
              </View>

              <View style={styles.totalBox}>
                <Text variant="caption" style={styles.totalLabel}>
                  PROTEIN
                </Text>
                <Text variant="body" style={styles.macroText}>
                  {Math.round(meal.totalProtein)}g
                </Text>
              </View>

              <View style={styles.totalBox}>
                <Text variant="caption" style={styles.totalLabel}>
                  CARBS
                </Text>
                <Text variant="body" style={styles.macroText}>
                  {Math.round(meal.totalCarbohydrates)}g
                </Text>
              </View>

              <View style={styles.totalBox}>
                <Text variant="caption" style={styles.totalLabel}>
                  FAT
                </Text>
                <Text variant="body" style={styles.macroText}>
                  {Math.round(meal.totalFat)}g
                </Text>
              </View>
            </View>
          </Card>

          {/* Food Entries Section */}
          <View style={styles.entriesSection}>
            <View style={styles.entriesHeader}>
              <Text variant="heading" style={styles.sectionTitle}>
                Foods in this Meal ({meal.entries?.length || 0})
              </Text>
              <Button
                variant="primary"
                size="sm"
                label="+ Add Food"
                fullWidth={false}
                onPress={() => setPickerVisible(true)}
                testID="add-food-btn"
              />
            </View>

            {meal.entries?.length === 0 ? (
              <Card style={styles.emptyEntriesCard} testID="no-entries-card">
                <Text variant="subheading" color={theme.colors.text.secondary} style={{ marginBottom: 4 }}>
                  No foods logged yet
                </Text>
                <Text variant="caption" color={theme.colors.text.muted} align="center" style={{ marginBottom: theme.spacing.sm }}>
                  Search your food catalog and add ingredients or food items to this meal.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  label="+ Add First Food"
                  fullWidth={false}
                  onPress={() => setPickerVisible(true)}
                />
              </Card>
            ) : (
              meal.entries.map((entry) => (
                <MealFoodRow
                  key={entry.id}
                  entry={entry}
                  onEditQuantity={(e) => setEditingEntry(e)}
                  onRemove={(id) => setEntryToRemove(id)}
                />
              ))
            )}
          </View>

          {/* Delete Meal Action */}
          <View style={styles.deleteSection}>
            <Button
              variant="danger"
              size="md"
              label="Delete Meal"
              onPress={() => setConfirmDeleteMealVisible(true)}
              isLoading={isMutating}
              testID="delete-meal-btn"
            />
          </View>
        </ScrollView>
      )}

      {/* FoodPicker Modal */}
      <FoodPicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelectFood={handleAddFood}
        isSubmitting={isMutating}
      />

      {/* FoodQuantityInput Modal */}
      {editingEntry && (
        <FoodQuantityInput
          visible={Boolean(editingEntry)}
          foodName={editingEntry.foodNameSnapshot}
          unit={editingEntry.unit}
          initialQuantity={editingEntry.quantity}
          onConfirm={handleUpdateQuantity}
          onClose={() => setEditingEntry(null)}
          isSubmitting={isMutating}
        />
      )}

      {/* Delete Food Entry Confirmation Modal */}
      <Modal
        visible={Boolean(entryToRemove)}
        transparent
        animationType="fade"
        onRequestClose={() => setEntryToRemove(null)}
        testID="remove-entry-modal"
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text variant="title" style={styles.modalTitle}>
              Remove Food?
            </Text>
            <Text variant="body" color={theme.colors.text.secondary} style={styles.modalBody}>
              Are you sure you want to remove this food from the meal?
            </Text>
            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                size="md"
                label="Cancel"
                fullWidth={false}
                onPress={() => setEntryToRemove(null)}
                disabled={isMutating}
              />
              <Button
                variant="danger"
                size="md"
                label="Remove"
                fullWidth={false}
                onPress={handleConfirmRemoveEntry}
                isLoading={isMutating}
                testID="confirm-remove-btn"
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Delete Meal Confirmation Modal */}
      <Modal
        visible={confirmDeleteMealVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDeleteMealVisible(false)}
        testID="delete-meal-confirm-modal"
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text variant="title" style={styles.modalTitle}>
              Delete Meal?
            </Text>
            <Text variant="body" color={theme.colors.text.secondary} style={styles.modalBody}>
              Are you sure you want to delete this meal? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <Button
                variant="ghost"
                size="md"
                label="Cancel"
                fullWidth={false}
                onPress={() => setConfirmDeleteMealVisible(false)}
                disabled={isMutating}
              />
              <Button
                variant="danger"
                size="md"
                label="Delete"
                fullWidth={false}
                onPress={handleDeleteMeal}
                isLoading={isMutating}
                testID="confirm-delete-meal-btn"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxxl,
  },
  mainCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  mealName: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
  },
  mealDate: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.brand.amber,
    marginTop: 2,
  },
  totalsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  totalBox: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  calText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.brand.amber,
  },
  macroText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  entriesSection: {
    marginBottom: theme.spacing.lg,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  emptyEntriesCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSection: {
    marginTop: theme.spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    padding: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  modalBody: {
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
});
