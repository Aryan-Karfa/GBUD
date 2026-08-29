import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

const mockUsers = new Map<string, any>();
const mockFoods = new Map<string, any>();
const mockMeals = new Map<string, any>();
const mockMealFoodEntries = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
    },
    food: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockFoods.get(where.id) || null;
        return null;
      }),
    },
    meal: {
      findFirst: vi.fn(async ({ where }: any) => {
        const m = mockMeals.get(where.id);
        if (!m || (where.userId && m.userId !== where.userId)) return null;

        const entries = Array.from(mockMealFoodEntries.values())
          .filter((e) => e.mealId === m.id)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        return { ...m, entries };
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return Array.from(mockMeals.values())
          .filter((m) => m.userId === where.userId)
          .map((m) => {
            const entries = Array.from(mockMealFoodEntries.values())
              .filter((e) => e.mealId === m.id)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            return { ...m, entries };
          });
      }),
      count: vi.fn(async ({ where }: any) => {
        return Array.from(mockMeals.values()).filter((m) => m.userId === where.userId).length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const meal = {
          id: `meal_${Math.random().toString(36).substring(2, 9)}`,
          userId: data.userId,
          name: data.name,
          mealDate: data.mealDate,
          mealType: data.mealType || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          entries: [],
        };
        mockMeals.set(meal.id, meal);
        return meal;
      }),
      delete: vi.fn(async ({ where }: any) => {
        mockMeals.delete(where.id);
        return true;
      }),
    },
    mealFoodEntry: {
      create: vi.fn(async ({ data }: any) => {
        const entry = {
          id: `mfe_${Math.random().toString(36).substring(2, 9)}`,
          mealId: data.mealId,
          foodId: data.foodId || null,
          foodNameSnapshot: data.foodNameSnapshot,
          quantity: data.quantity,
          unit: data.unit,
          servingSizeSnapshot: data.servingSizeSnapshot,
          servingUnitSnapshot: data.servingUnitSnapshot,
          caloriesPerServingSnapshot: data.caloriesPerServingSnapshot,
          proteinPerServingSnapshot: data.proteinPerServingSnapshot,
          carbohydratesPerServingSnapshot: data.carbohydratesPerServingSnapshot,
          fatPerServingSnapshot: data.fatPerServingSnapshot,
          fiberPerServingSnapshot: data.fiberPerServingSnapshot,
          caloriesSnapshot: data.caloriesSnapshot,
          proteinSnapshot: data.proteinSnapshot,
          carbohydratesSnapshot: data.carbohydratesSnapshot,
          fatSnapshot: data.fatSnapshot,
          fiberSnapshot: data.fiberSnapshot,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockMealFoodEntries.set(entry.id, entry);
        return entry;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const e = mockMealFoodEntries.get(where.id);
        if (!e) return null;
        const updated = { ...e, ...data, updatedAt: new Date() };
        mockMealFoodEntries.set(e.id, updated);
        return updated;
      }),
      delete: vi.fn(async ({ where }: any) => {
        mockMealFoodEntries.delete(where.id);
        return true;
      }),
    },
  };

  return {
    prisma: {
      ...mockTx,
      $transaction: vi.fn(async (cb: any) => cb(mockTx)),
    },
  };
});

describe('FUEL Meals & Food Entries API (/api/v1/fuel/meals)', () => {
  const app = createApp();

  const userA = {
    id: 'usr_meal_a',
    email: 'meal_a@example.com',
    username: 'meal_a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tokenA = signAccessToken({ id: userA.id, email: userA.email, username: userA.username });

  const sysChicken = {
    id: 'food_sys_chicken',
    name: 'Chicken Breast',
    servingSize: 100,
    servingUnit: 'g',
    calories: 165,
    protein: 31,
    carbohydrates: 0,
    fat: 3.6,
    fiber: 0,
    isActive: true,
    ownerId: null,
  };

  beforeEach(() => {
    mockUsers.clear();
    mockFoods.clear();
    mockMeals.clear();
    mockMealFoodEntries.clear();

    mockUsers.set(userA.id, userA);
    mockFoods.set(sysChicken.id, { ...sysChicken });
  });

  it('should create meal and add food entry with server-calculated snapshot', async () => {
    // 1. Create meal
    const mealRes = await request(app)
      .post('/api/v1/fuel/meals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Lunch',
        mealDate: '2026-08-17',
        mealType: 'LUNCH',
      });

    expect(mealRes.status).toBe(201);
    const mealId = mealRes.body.data.id;

    // 2. Add 200g Chicken Breast
    const entryRes = await request(app)
      .post(`/api/v1/fuel/meals/${mealId}/foods`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        foodId: sysChicken.id,
        quantity: 200,
        unit: 'g',
      });

    expect(entryRes.status).toBe(201);
    expect(entryRes.body.data.totalCalories).toBe(330);
    expect(entryRes.body.data.totalProtein).toBe(62);
    expect(entryRes.body.data.entries[0].foodNameSnapshot).toBe('Chicken Breast');
  });

  it('should reject unit mismatch with 422 VALIDATION_ERROR (e.g. food is "g" but entry specifies "ml")', async () => {
    const mealRes = await request(app)
      .post('/api/v1/fuel/meals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Lunch',
        mealDate: '2026-08-17',
      });

    const mealId = mealRes.body.data.id;

    const entryRes = await request(app)
      .post(`/api/v1/fuel/meals/${mealId}/foods`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        foodId: sysChicken.id,
        quantity: 200,
        unit: 'ml', // Mismatch!
      });

    expect(entryRes.status).toBe(422);
    expect(entryRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('Historical Quantity Update Test: food catalog edit does NOT alter recalculated entry snapshot during quantity updates', async () => {
    // 1. Create meal & add 200g Chicken (330 kcal)
    const mealRes = await request(app)
      .post('/api/v1/fuel/meals')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Dinner', mealDate: '2026-08-17' });

    const mealId = mealRes.body.data.id;

    const addRes = await request(app)
      .post(`/api/v1/fuel/meals/${mealId}/foods`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ foodId: sysChicken.id, quantity: 200, unit: 'g' });

    const entryId = addRes.body.data.entries[0].id;

    // 2. Modify food catalog in store: 100g is now 180 kcal!
    const catalogItem = mockFoods.get(sysChicken.id);
    catalogItem.calories = 180;

    // 3. User updates quantity: 200g -> 250g
    const updateRes = await request(app)
      .patch(`/api/v1/fuel/meals/${mealId}/foods/${entryId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ quantity: 250 });

    expect(updateRes.status).toBe(200);
    // Recalculated: 250 / 100 * 165 (stored snapshot) = 412.5 kcal (NOT 250 / 100 * 180 = 450)
    expect(updateRes.body.data.totalCalories).toBe(412.5);
  });
});
