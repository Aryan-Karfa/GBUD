import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  FoodTypeBadge,
  MealTypeBadge,
  FoodCard,
  FoodListItem,
  MealCard,
  MealFoodRow,
  NutritionProgressRow,
  NutritionSummaryCard,
  NutritionTargetCard,
  DateSelector,
  FoodQuantityInput,
  FuelErrorState,
} from '../features/fuel/components';
import {
  FoodDTO,
  MealDTO,
  MealFoodEntryDTO,
  NutritionDailySummaryDTO,
  NutritionTargetDTO,
  NutritionTargetComparisonDTO,
} from '../features/fuel/fuel.types';

describe('FUEL UI Components', () => {
  describe('FoodTypeBadge', () => {
    it('renders SYSTEM badge when isCustom is false', () => {
      const el = React.createElement(FoodTypeBadge, { isCustom: false });
      expect(el.props.isCustom).toBe(false);
    });

    it('renders CUSTOM badge when isCustom is true', () => {
      const el = React.createElement(FoodTypeBadge, { isCustom: true });
      expect(el.props.isCustom).toBe(true);
    });
  });

  describe('MealTypeBadge', () => {
    it('renders meal type badge with uppercase type', () => {
      const el = React.createElement(MealTypeBadge, { mealType: 'BREAKFAST' });
      expect(el.props.mealType).toBe('BREAKFAST');
    });

    it('handles null/undefined gracefully', () => {
      const el = React.createElement(MealTypeBadge, { mealType: null });
      expect(el.props.mealType).toBeNull();
    });
  });

  describe('FoodCard', () => {
    const mockFood: FoodDTO = {
      id: 'food-1',
      name: 'Rolled Oats',
      description: 'Whole grain rolled oats',
      servingSize: 40,
      servingUnit: 'g',
      calories: 150,
      protein: 5,
      carbohydrates: 27,
      fat: 2.5,
      fiber: 4,
      isActive: true,
      isCustom: false,
      ownerId: null,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    it('renders food details and attaches onPress', () => {
      const onPress = vi.fn();
      const el = React.createElement(FoodCard, { food: mockFood, onPress });
      expect(el.props.food.name).toBe('Rolled Oats');
      expect(el.props.onPress).toBe(onPress);
    });
  });

  describe('FoodListItem', () => {
    it('renders compact food row', () => {
      const mockFood: FoodDTO = {
        id: 'food-2',
        name: 'Egg Whites',
        description: null,
        servingSize: 100,
        servingUnit: 'g',
        calories: 52,
        protein: 11,
        carbohydrates: 0.7,
        fat: 0.2,
        fiber: null,
        isActive: true,
        isCustom: false,
        ownerId: null,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      const onPress = vi.fn();
      const el = React.createElement(FoodListItem, { food: mockFood, onPress });
      expect(el.props.food.name).toBe('Egg Whites');
      expect(el.props.onPress).toBe(onPress);
    });
  });

  describe('MealCard', () => {
    it('renders meal totals and entry count', () => {
      const mockMeal: MealDTO = {
        id: 'm-1',
        userId: 'u-1',
        name: 'Pre-Workout Meal',
        mealDate: '2026-09-03',
        mealType: 'LUNCH',
        totalCalories: 550,
        totalProtein: 40,
        totalCarbohydrates: 65,
        totalFat: 12,
        totalFiber: 6,
        createdAt: '2026-09-03',
        updatedAt: '2026-09-03',
        entries: [],
      };
      const onPress = vi.fn();
      const el = React.createElement(MealCard, { meal: mockMeal, onPress });
      expect(el.props.meal.name).toBe('Pre-Workout Meal');
      expect(el.props.meal.totalCalories).toBe(550);
    });
  });

  describe('MealFoodRow', () => {
    const mockEntry: MealFoodEntryDTO = {
      id: 'e-1',
      mealId: 'm-1',
      foodId: 'f-1',
      foodNameSnapshot: 'Greek Yogurt',
      quantity: 170,
      unit: 'g',
      servingSizeSnapshot: 170,
      servingUnitSnapshot: 'g',
      caloriesPerServingSnapshot: 100,
      proteinPerServingSnapshot: 18,
      carbohydratesPerServingSnapshot: 6,
      fatPerServingSnapshot: 0,
      fiberPerServingSnapshot: 0,
      caloriesSnapshot: 100,
      proteinSnapshot: 18,
      carbohydratesSnapshot: 6,
      fatSnapshot: 0,
      fiberSnapshot: 0,
      createdAt: '2026-09-03',
      updatedAt: '2026-09-03',
    };

    it('renders immutable food snapshot values and callbacks', () => {
      const onEdit = vi.fn();
      const onRemove = vi.fn();
      const el = React.createElement(MealFoodRow, {
        entry: mockEntry,
        onEditQuantity: onEdit,
        onRemove,
      });

      expect(el.props.entry.foodNameSnapshot).toBe('Greek Yogurt');
      expect(el.props.entry.caloriesSnapshot).toBe(100);
      expect(el.props.onEditQuantity).toBe(onEdit);
      expect(el.props.onRemove).toBe(onRemove);
    });

    it('respects readOnly flag to hide actions', () => {
      const el = React.createElement(MealFoodRow, {
        entry: mockEntry,
        readOnly: true,
      });
      expect(el.props.readOnly).toBe(true);
    });
  });

  describe('NutritionProgressRow', () => {
    it('renders actual and target comparison values', () => {
      const el = React.createElement(NutritionProgressRow, {
        label: 'PROTEIN',
        actual: 160,
        target: 180,
        unit: 'g',
      });
      expect(el.props.label).toBe('PROTEIN');
      expect(el.props.actual).toBe(160);
      expect(el.props.target).toBe(180);
    });
  });

  describe('NutritionSummaryCard', () => {
    it('renders summary and comparison data', () => {
      const mockSummary: NutritionDailySummaryDTO = {
        date: '2026-09-03',
        calories: 2100,
        protein: 160,
        carbohydrates: 220,
        fat: 65,
        fiber: 28,
        meals: 3,
      };
      const mockComparison: NutritionTargetComparisonDTO = {
        date: '2026-09-03',
        actual: { calories: 2100, protein: 160, carbohydrates: 220, fat: 65 },
        target: { calories: 2500, protein: 180, carbohydrates: 250, fat: 70 },
        remaining: { calories: 400, protein: 20, carbohydrates: 30, fat: 5 },
      };

      const el = React.createElement(NutritionSummaryCard, {
        summary: mockSummary,
        comparison: mockComparison,
      });

      expect(el.props.summary?.calories).toBe(2100);
      expect(el.props.comparison?.target?.calories).toBe(2500);
    });
  });

  describe('NutritionTargetCard', () => {
    it('renders target specs and active badge when effective', () => {
      const mockTarget: NutritionTargetDTO = {
        id: 't-1',
        userId: 'u-1',
        calories: 2500,
        protein: 180,
        carbohydrates: 250,
        fat: 70,
        effectiveFrom: '2026-09-01',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      };

      const el = React.createElement(NutritionTargetCard, {
        target: mockTarget,
        isEffective: true,
      });

      expect(el.props.target.calories).toBe(2500);
      expect(el.props.isEffective).toBe(true);
    });
  });

  describe('DateSelector', () => {
    it('renders selected date and navigation callbacks', () => {
      const onDateChange = vi.fn();
      const el = React.createElement(DateSelector, {
        selectedDate: '2026-09-03',
        onDateChange,
      });

      expect(el.props.selectedDate).toBe('2026-09-03');
      expect(el.props.onDateChange).toBe(onDateChange);
    });
  });

  describe('FoodQuantityInput', () => {
    it('renders modal with food name and callbacks', () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      const el = React.createElement(FoodQuantityInput, {
        visible: true,
        foodName: 'Oats',
        unit: 'g',
        initialQuantity: 50,
        onConfirm,
        onClose,
      });

      expect(el.props.foodName).toBe('Oats');
      expect(el.props.initialQuantity).toBe(50);
      expect(el.props.visible).toBe(true);
    });
  });

  describe('FuelErrorState', () => {
    it('renders error message and retry handler', () => {
      const onRetry = vi.fn();
      const el = React.createElement(FuelErrorState, {
        error: 'Network connection failed',
        onRetry,
      });

      expect(el.props.error).toBe('Network connection failed');
      expect(el.props.onRetry).toBe(onRetry);
    });
  });
});
