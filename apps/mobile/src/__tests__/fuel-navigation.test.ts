import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavigationManager } from '../navigation/navigation.manager';

describe('FUEL Navigation Stack & Behavior', () => {
  let nav: NavigationManager;

  beforeEach(() => {
    nav = new NavigationManager();
    nav.setAuthStatus('AUTHENTICATED');
  });

  it('initializes on Home tab with FuelHome as root of fuel stack', () => {
    expect(nav.getCurrentTab()).toBe('Home');
    expect(nav.getFuelScreen()).toBe('FuelHome');
  });

  it('navigateFuel sets currentTab to Fuel and pushes screen', () => {
    nav.navigateFuel('FoodLibrary');
    expect(nav.getCurrentTab()).toBe('Fuel');
    expect(nav.getFuelScreen()).toBe('FoodLibrary');
  });

  it('navigateFuel with params stores params correctly', () => {
    nav.navigateFuel('FoodDetail', { foodId: 'food-123' });
    expect(nav.getCurrentTab()).toBe('Fuel');
    expect(nav.getFuelScreen()).toBe('FoodDetail');
    expect(nav.getFuelParams()).toEqual({ foodId: 'food-123' });
  });

  it('navigateFuel to FuelHome resets the fuel stack', () => {
    nav.navigateFuel('FoodLibrary');
    nav.navigateFuel('FoodDetail', { foodId: 'food-1' });
    expect(nav.getFuelScreen()).toBe('FoodDetail');

    nav.navigateFuel('FuelHome');
    expect(nav.getFuelScreen()).toBe('FuelHome');
  });

  it('goBack pops the fuel stack until root', () => {
    nav.navigateFuel('Meals', { date: '2026-09-03' });
    nav.navigateFuel('MealDetail', { mealId: 'meal-99' });

    expect(nav.getFuelScreen()).toBe('MealDetail');

    // First back: pops MealDetail -> back to Meals
    const handled1 = nav.goBack();
    expect(handled1).toBe(true);
    expect(nav.getFuelScreen()).toBe('Meals');

    // Second back: pops Meals -> back to FuelHome
    const handled2 = nav.goBack();
    expect(handled2).toBe(true);
    expect(nav.getFuelScreen()).toBe('FuelHome');

    // Third back: at root FuelHome -> transitions to Home tab
    const handled3 = nav.goBack();
    expect(handled3).toBe(true);
    expect(nav.getCurrentTab()).toBe('Home');
  });

  it('respects registered back interceptor', () => {
    nav.navigateFuel('MealDetail', { mealId: 'meal-1' });

    const interceptor = vi.fn().mockReturnValue(true);
    nav.registerBackInterceptor(interceptor);

    const handled = nav.goBack();
    expect(handled).toBe(true);
    expect(interceptor).toHaveBeenCalled();
    // Screen should not have popped because interceptor consumed it
    expect(nav.getFuelScreen()).toBe('MealDetail');

    // When interceptor returns false, navigation proceeds
    nav.registerBackInterceptor(() => false);
    nav.goBack();
    expect(nav.getFuelScreen()).toBe('FuelHome');
  });

  it('reset clears the fuel stack to FuelHome', () => {
    nav.navigateFuel('NutritionHistory');
    expect(nav.getFuelScreen()).toBe('NutritionHistory');

    nav.reset();
    expect(nav.getCurrentTab()).toBe('Home');
    expect(nav.getFuelScreen()).toBe('FuelHome');
  });
});
