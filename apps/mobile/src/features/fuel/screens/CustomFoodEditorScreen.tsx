import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '../../../components/layout/Screen';
import { Text } from '../../../components/common/Text';
import { Card } from '../../../components/layout/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/common/Button';
import { LoadingIndicator } from '../../../components/feedback/LoadingIndicator';
import { useNavigation } from '../../../navigation/NavigationProvider';
import { useFoods } from '../hooks/useFoods';
import { FuelErrorState } from '../components';
import { theme } from '../../../theme/theme';

export interface CustomFoodEditorScreenProps {
  foodId?: string;
}

export const CustomFoodEditorScreen: React.FC<CustomFoodEditorScreenProps> = ({
  foodId,
}) => {
  const isEditing = Boolean(foodId);
  const { navigateFuel, goBack } = useNavigation();
  const { getFoodById, createFood, updateFood, isMutating } = useFoods();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoadingFood, setIsLoadingFood] = useState(false);

  useEffect(() => {
    if (foodId) {
      setIsLoadingFood(true);
      getFoodById(foodId).then((food) => {
        if (food) {
          setName(food.name);
          setDescription(food.description || '');
          setServingSize(String(food.servingSize));
          setServingUnit(food.servingUnit);
          setCalories(String(food.calories));
          setProtein(String(food.protein));
          setCarbs(String(food.carbohydrates));
          setFat(String(food.fat));
          setFiber(food.fiber !== null && food.fiber !== undefined ? String(food.fiber) : '');
        }
        setIsLoadingFood(false);
      });
    }
  }, [foodId, getFoodById]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Food name is required';
    if (!servingUnit.trim()) errs.servingUnit = 'Serving unit is required (e.g. g, ml)';

    const size = parseFloat(servingSize);
    if (isNaN(size) || size <= 0) errs.servingSize = 'Serving size must be greater than 0';

    const cal = parseFloat(calories);
    if (isNaN(cal) || cal < 0) errs.calories = 'Calories must be 0 or greater';

    const p = parseFloat(protein);
    if (isNaN(p) || p < 0) errs.protein = 'Protein must be 0 or greater';

    const c = parseFloat(carbs);
    if (isNaN(c) || c < 0) errs.carbs = 'Carbohydrates must be 0 or greater';

    const f = parseFloat(fat);
    if (isNaN(f) || f < 0) errs.fat = 'Fat must be 0 or greater';

    if (fiber.trim()) {
      const fib = parseFloat(fiber);
      if (isNaN(fib) || fib < 0) errs.fiber = 'Fiber must be 0 or greater';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setGlobalError(null);

    const inputData = {
      name: name.trim(),
      description: description.trim() || undefined,
      servingSize: parseFloat(servingSize),
      servingUnit: servingUnit.trim(),
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      carbohydrates: parseFloat(carbs),
      fat: parseFloat(fat),
      fiber: fiber.trim() ? parseFloat(fiber) : undefined,
    };

    try {
      if (isEditing && foodId) {
        const updated = await updateFood(foodId, inputData);
        navigateFuel('FoodDetail', { foodId: updated.id });
      } else {
        const created = await createFood(inputData);
        navigateFuel('FoodDetail', { foodId: created.id });
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to save food');
    }
  };

  if (isLoadingFood) {
    return (
      <Screen padding="md">
        <View style={styles.center}>
          <LoadingIndicator />
        </View>
      </Screen>
    );
  }

  return (
    <Screen padding="md" testID="custom-food-editor-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="custom-food-editor-back-btn"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text variant="title" style={styles.headerTitle}>
          {isEditing ? 'Edit Custom Food' : 'Create Custom Food'}
        </Text>
      </View>

      {globalError && (
        <FuelErrorState
          error={globalError}
          onRetry={handleSave}
          testID="custom-food-error"
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Details */}
        <Card style={styles.card}>
          <Text variant="caption" style={styles.sectionHeading}>
            FOOD IDENTIFICATION
          </Text>

          <Input
            label="Food Name *"
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Oatmeal with Whey"
            error={errors.name}
            testID="food-name-input"
          />

          <Input
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. 50g rolled oats + 1 scoop chocolate protein"
            testID="food-description-input"
          />

          <View style={styles.twoColumn}>
            <View style={{ flex: 1 }}>
              <Input
                label="Serving Size *"
                value={servingSize}
                onChangeText={(t) => {
                  setServingSize(t);
                  if (errors.servingSize) setErrors((prev) => ({ ...prev, servingSize: '' }));
                }}
                keyboardType="decimal-pad"
                error={errors.servingSize}
                testID="food-serving-size-input"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Serving Unit *"
                value={servingUnit}
                onChangeText={(t) => {
                  setServingUnit(t);
                  if (errors.servingUnit) setErrors((prev) => ({ ...prev, servingUnit: '' }));
                }}
                placeholder="g, ml, scoop, etc."
                error={errors.servingUnit}
                testID="food-serving-unit-input"
              />
            </View>
          </View>
        </Card>

        {/* Macros */}
        <Card style={styles.card}>
          <Text variant="caption" style={styles.sectionHeading}>
            NUTRITION FACTS PER SERVING
          </Text>

          <Input
            label="Calories (kcal) *"
            value={calories}
            onChangeText={(t) => {
              setCalories(t);
              if (errors.calories) setErrors((prev) => ({ ...prev, calories: '' }));
            }}
            keyboardType="decimal-pad"
            error={errors.calories}
            testID="food-calories-input"
          />

          <View style={styles.twoColumn}>
            <View style={{ flex: 1 }}>
              <Input
                label="Protein (g) *"
                value={protein}
                onChangeText={(t) => {
                  setProtein(t);
                  if (errors.protein) setErrors((prev) => ({ ...prev, protein: '' }));
                }}
                keyboardType="decimal-pad"
                error={errors.protein}
                testID="food-protein-input"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Carbohydrates (g) *"
                value={carbs}
                onChangeText={(t) => {
                  setCarbs(t);
                  if (errors.carbs) setErrors((prev) => ({ ...prev, carbs: '' }));
                }}
                keyboardType="decimal-pad"
                error={errors.carbs}
                testID="food-carbs-input"
              />
            </View>
          </View>

          <View style={styles.twoColumn}>
            <View style={{ flex: 1 }}>
              <Input
                label="Fat (g) *"
                value={fat}
                onChangeText={(t) => {
                  setFat(t);
                  if (errors.fat) setErrors((prev) => ({ ...prev, fat: '' }));
                }}
                keyboardType="decimal-pad"
                error={errors.fat}
                testID="food-fat-input"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Fiber (g) (Optional)"
                value={fiber}
                onChangeText={(t) => {
                  setFiber(t);
                  if (errors.fiber) setErrors((prev) => ({ ...prev, fiber: '' }));
                }}
                keyboardType="decimal-pad"
                error={errors.fiber}
                testID="food-fiber-input"
              />
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          label={isEditing ? 'Save Changes' : 'Create Custom Food'}
          onPress={handleSave}
          isLoading={isMutating}
          testID="save-food-btn"
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
  sectionHeading: {
    fontSize: 10,
    letterSpacing: 1,
    color: theme.colors.text.muted,
    marginBottom: theme.spacing.sm,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
