import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

const mockUsers = new Map<string, any>();
const mockFoods = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
    },
    food: {
      findMany: vi.fn(async ({ where, skip = 0, take = 20 }: any) => {
        let list = Array.from(mockFoods.values()).filter((f) => f.isActive);

        list = list.filter((f) => f.ownerId === null || f.ownerId === where.OR?.[1]?.ownerId || f.ownerId === where.AND?.[0]?.OR?.[1]?.ownerId);

        if (where?.OR?.[0]?.name?.contains) {
          const search = where.OR[0].name.contains.toLowerCase();
          list = list.filter((f) => f.name.toLowerCase().includes(search) || (f.description && f.description.toLowerCase().includes(search)));
        }

        return list.slice(skip, skip + take);
      }),
      count: vi.fn(async ({ where }: any) => {
        let list = Array.from(mockFoods.values()).filter((f) => f.isActive);
        list = list.filter((f) => f.ownerId === null || f.ownerId === where.OR?.[1]?.ownerId || f.ownerId === where.AND?.[0]?.OR?.[1]?.ownerId);
        return list.length;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockFoods.get(where.id) || null;
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const food = {
          id: `food_${Math.random().toString(36).substring(2, 9)}`,
          name: data.name,
          description: data.description || null,
          servingSize: data.servingSize,
          servingUnit: data.servingUnit,
          calories: data.calories,
          protein: data.protein,
          carbohydrates: data.carbohydrates,
          fat: data.fat,
          fiber: data.fiber ?? null,
          isActive: data.isActive ?? true,
          ownerId: data.ownerId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockFoods.set(food.id, food);
        return food;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const f = mockFoods.get(where.id);
        if (!f) return null;
        const updated = { ...f, ...data, updatedAt: new Date() };
        mockFoods.set(f.id, updated);
        return updated;
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

describe('FUEL Food Catalog API (/api/v1/fuel/foods)', () => {
  const app = createApp();

  const userA = {
    id: 'usr_food_a',
    email: 'food_a@example.com',
    username: 'food_a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userB = {
    id: 'usr_food_b',
    email: 'food_b@example.com',
    username: 'food_b',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tokenA = signAccessToken({ id: userA.id, email: userA.email, username: userA.username });
  const tokenB = signAccessToken({ id: userB.id, email: userB.email, username: userB.username });

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUsers.clear();
    mockFoods.clear();

    mockUsers.set(userA.id, userA);
    mockUsers.set(userB.id, userB);
    mockFoods.set(sysChicken.id, sysChicken);
  });

  it('should list system foods for all authenticated users', async () => {
    const res = await request(app)
      .get('/api/v1/fuel/foods')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].name).toBe('Chicken Breast');
    expect(res.body.data.items[0].isCustom).toBe(false);
  });

  it('should allow user to create custom food item', async () => {
    const res = await request(app)
      .post('/api/v1/fuel/foods')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Protein Shake',
        servingSize: 1,
        servingUnit: 'serving',
        calories: 200,
        protein: 30,
        carbohydrates: 5,
        fat: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Protein Shake');
    expect(res.body.data.isCustom).toBe(true);
    expect(res.body.data.ownerId).toBe(userA.id);
  });

  it('User B custom food is NOT visible or editable by User A (404 Isolation)', async () => {
    const foodB = {
      id: 'food_custom_b',
      name: 'User B Shake',
      servingSize: 1,
      servingUnit: 'serving',
      calories: 150,
      protein: 20,
      carbohydrates: 2,
      fat: 2,
      isActive: true,
      ownerId: userB.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockFoods.set(foodB.id, foodB);

    // User A GET -> 404
    const getRes = await request(app)
      .get(`/api/v1/fuel/foods/${foodB.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(getRes.status).toBe(404);

    // User A PATCH -> 404
    const patchRes = await request(app)
      .patch(`/api/v1/fuel/foods/${foodB.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Hacked Shake' });

    expect(patchRes.status).toBe(404);
  });

  it('should reject modification or deletion of system foods with 403 FORBIDDEN', async () => {
    const patchRes = await request(app)
      .patch(`/api/v1/fuel/foods/${sysChicken.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Hacked Chicken' });

    expect(patchRes.status).toBe(403);

    const delRes = await request(app)
      .delete(`/api/v1/fuel/foods/${sysChicken.id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(delRes.status).toBe(403);
  });
});
