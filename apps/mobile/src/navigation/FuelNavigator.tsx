import React from 'react';
import { useNavigation } from './NavigationProvider';
import {
  FuelHomeScreen,
  FoodLibraryScreen,
  FoodDetailScreen,
  CustomFoodEditorScreen,
  MealsScreen,
  MealDetailScreen,
  MealEditorScreen,
  NutritionTargetScreen,
  NutritionHistoryScreen,
  NutritionComparisonScreen,
} from '../features/fuel';

export const FuelNavigator: React.FC = () => {
  const { fuelScreen, fuelParams } = useNavigation();

  switch (fuelScreen) {
    case 'FuelHome':
      return <FuelHomeScreen initialDate={fuelParams?.date} />;

    case 'FoodLibrary':
      return <FoodLibraryScreen />;

    case 'FoodDetail':
      return <FoodDetailScreen foodId={fuelParams?.foodId} />;

    case 'CustomFoodEditor':
      return <CustomFoodEditorScreen foodId={fuelParams?.foodId} />;

    case 'Meals':
      return <MealsScreen date={fuelParams?.date} />;

    case 'MealDetail':
      return <MealDetailScreen mealId={fuelParams?.mealId} />;

    case 'MealEditor':
      return (
        <MealEditorScreen
          mealId={fuelParams?.mealId}
          date={fuelParams?.date}
          mealType={fuelParams?.mealType}
        />
      );

    case 'NutritionTarget':
      return <NutritionTargetScreen date={fuelParams?.date} />;

    case 'NutritionHistory':
      return <NutritionHistoryScreen />;

    case 'NutritionComparison':
      return (
        <NutritionComparisonScreen
          dateA={fuelParams?.dateA}
          dateB={fuelParams?.dateB}
        />
      );

    default:
      return <FuelHomeScreen initialDate={fuelParams?.date} />;
  }
};
