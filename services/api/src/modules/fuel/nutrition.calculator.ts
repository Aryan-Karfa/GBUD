export interface PerServingNutrients {
  servingSize: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number | null;
}

export interface ScaledNutritionResult {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number | null;
}

/**
 * Calculates quantity-scaled nutrition values given per-serving reference nutrients and quantity.
 * Multiplier = quantity / servingSize
 * All calculated nutrients are rounded to 2 decimal places.
 */
export function calculateNutritionForQuantity(
  perServing: PerServingNutrients,
  quantity: number
): ScaledNutritionResult {
  if (perServing.servingSize <= 0 || quantity <= 0) {
    return {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: perServing.fiber !== undefined && perServing.fiber !== null ? 0 : null,
    };
  }

  const multiplier = quantity / perServing.servingSize;

  const round = (val: number) => Math.round(val * 100) / 100;

  return {
    calories: round(perServing.calories * multiplier),
    protein: round(perServing.protein * multiplier),
    carbohydrates: round(perServing.carbohydrates * multiplier),
    fat: round(perServing.fat * multiplier),
    fiber: perServing.fiber !== undefined && perServing.fiber !== null ? round(perServing.fiber * multiplier) : null,
  };
}
