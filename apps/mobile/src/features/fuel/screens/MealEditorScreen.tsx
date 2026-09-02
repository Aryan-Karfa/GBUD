import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useMeals } from '../hooks/useMeals';
import { MealType, getTodayDateString } from '../fuel.types';
import { FuelErrorState } from '../components';
import { theme } from '../../../theme/theme';

export interface MealEditorScreenProps {
  mealId?: string;
  date?: string;
  mealType?: MealType;
}

export const MealEditorScreen: React.FC<MealEditorScreenProps> = ({
  mealId,
  date: paramDate,
  mealType: paramMealType,
}) => {
  const isEditing = Boolean(mealId);
  const { navigateFuel, goBack } = useNavigation();
  const { getMealById, createMeal, updateMeal, isMutating } = useMeals({ autoFetch: false });

  const [name, setName] = useState('');
  const [mealDate, setMealDate] = useState(paramDate || getTodayDateString());
  const [mealType, setMealType] = useState<MealType>(paramMealType || 'LUNCH');

  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoadingMeal, setIsLoadingMeal] = useState(false);

  const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'];

  useEffect(() => {
    if (mealId) {
      setIsLoadingMeal(true);
      getMealById(mealId).then((meal) => {
        if (meal) {
          setName(meal.name);
          setMealDate(meal.mealDate);
          if (meal.mealType) {
            setMealType(meal.mealType as MealType);
          }
        }
        setIsLoadingMeal(false);
      });
    }
  }, [mealId, getMealById]);

  const validate = (): boolean => {
    let isValid = true;
    if (!name.trim()) {
      setNameError('Meal name is required');
      isValid = false;
    } else {
      setNameError(null);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(mealDate.trim())) {
      setDateError('Date must be in YYYY-MM-DD format');
      isValid = false;
    } else {
      setDateError(null);
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setGlobalError(null);

    try {
      if (isEditing && mealId) {
        const updated = await updateMeal(mealId, {
          name: name.trim(),
          mealDate: mealDate.trim(),
          mealType,
        });
        navigateFuel('MealDetail', { mealId: updated.id });
      } else {
        const created = await createMeal({
          name: name.trim(),
          mealDate: mealDate.trim(),
          mealType,
        });
        navigateFuel('MealDetail', { mealId: created.id });
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to save meal');
    }
  };

  if (isLoadingMeal) {
    return (
      <Screen padding="md">
        <View style={styles.center}>
          <LoadingIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding="md" testID="meal-editor-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="meal-editor-back-btn"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text variant="title" style={styles.headerTitle}>
          {isEditing ? 'Edit Meal Details' : 'Log New Meal'}
        </Text>
      </View>

      {globalError && (
        <FuelErrorState
          error={globalError}
          onRetry={handleSave}
          testID="meal-editor-error"
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Text variant="caption" style={styles.sectionLabel}>
            MEAL INFORMATION
          </Text>

          {/* Name Input */}
          <Input
            label="Meal Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (nameError) setNameError(null);
            }}
            placeholder="e.g. Post-Workout Lunch"
            error={nameError || undefined}
            testID="meal-name-input"
          />

          {/* Date Input */}
          <Input
            label="Date (YYYY-MM-DD) *"
            value={mealDate}
            onChangeText={(t) => {
              setMealDate(t);
              if (dateError) setDateError(null);
            }}
            placeholder="2026-09-03"
            error={dateError || undefined}
            testID="meal-date-input"
          />

          {/* Meal Type Chips */}
          <View style={styles.typeContainer}>
            <Text variant="caption" style={styles.typeLabel}>
              Meal Category
            </Text>
            <View style={styles.typeGrid}>
              {mealTypes.map((t) => {
                const isSelected = mealType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setMealType(t)}
                    style={[styles.typeChip, isSelected && styles.typeChipSelected]}
                    testID={`meal-type-${t.toLowerCase()}`}
                  >
                    <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Card>

        <Button
          variant="primary"
          size="lg"
          label={isEditing ? 'Save Changes' : 'Create Meal & Add Foods'}
          onPress={handleSave}
          isLoading={isMutating}
          testID="save-meal-btn"
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
    gap: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  typeContainer: {
    marginTop: theme.spacing.xs,
  },
  typeLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  typeChipSelected: {
    borderColor: theme.colors.brand.amber,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  typeText: {
    fontSize: 11,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
  },
  typeTextSelected: {
    color: theme.colors.brand.amber,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
