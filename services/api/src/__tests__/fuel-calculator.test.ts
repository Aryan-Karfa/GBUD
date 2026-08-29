import { describe, it, expect } from 'vitest';
import { calculateNutritionForQuantity } from '../modules/fuel/nutrition.calculator';

describe('FUEL Nutrition Calculator (calculateNutritionForQuantity)', () => {
  it('should scale nutrients proportionally for 250g given 100g base serving', () => {
    const base = {
      servingSize: 100,
      calories: 200,
      protein: 30,
      carbohydrates: 10,
      fat: 5,
      fiber: 4,
    };

    const result = calculateNutritionForQuantity(base, 250);

    expect(result.calories).toBe(500);
    expect(result.protein).toBe(75);
    expect(result.carbohydrates).toBe(25);
    expect(result.fat).toBe(12.5);
    expect(result.fiber).toBe(10);
  });

  it('should handle zero or negative quantities safely', () => {
    const base = {
      servingSize: 100,
      calories: 200,
      protein: 30,
      carbohydrates: 10,
      fat: 5,
    };

    const result = calculateNutritionForQuantity(base, 0);

    expect(result.calories).toBe(0);
    expect(result.protein).toBe(0);
    expect(result.carbohydrates).toBe(0);
    expect(result.fat).toBe(0);
    expect(result.fiber).toBeNull();
  });

  it('should return null for fiber if fiber was not specified', () => {
    const base = {
      servingSize: 1,
      calories: 70,
      protein: 6,
      carbohydrates: 0,
      fat: 5,
      fiber: null,
    };

    const result = calculateNutritionForQuantity(base, 2);

    expect(result.calories).toBe(140);
    expect(result.protein).toBe(12);
    expect(result.fiber).toBeNull();
  });
});
