import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

const mockUsers = new Map<string, any>();
const mockTargets = new Map<string, any>();
const mockMeals = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
    },
    nutritionTarget: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.userId_effectiveFrom) {
          const { userId, effectiveFrom } = where.userId_effectiveFrom;
          const effStr = effectiveFrom.toISOString().split('T')[0];
          for (const t of mockTargets.values()) {
            if (t.userId === userId && t.effectiveFrom.toISOString().split('T')[0] === effStr) {
              return t;
            }
          }
        }
        return null;
      }),
      findFirst: vi.fn(async ({ where, orderBy }: any) => {
        let list = Array.from(mockTargets.values()).filter((t) => t.userId === where.userId);

        if (where?.id) {
          return mockTargets.get(where.id) || null;
        }

        if (where?.effectiveFrom?.lte) {
          const lteMs = where.effectiveFrom.lte.getTime();
          list = list.filter((t) => t.effectiveFrom.getTime() <= lteMs);
        }

        if (orderBy?.effectiveFrom === 'desc') {
          list.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
        }

        return list[0] || null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return Array.from(mockTargets.values())
          .filter((t) => t.userId === where.userId)
          .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());
      }),
      count: vi.fn(async ({ where }: any) => {
        return Array.from(mockTargets.values()).filter((t) => t.userId === where.userId).length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const target = {
          id: `tgt_${Math.random().toString(36).substring(2, 9)}`,
          userId: data.userId,
          calories: data.calories,
          protein: data.protein,
          carbohydrates: data.carbohydrates,
          fat: data.fat,
          effectiveFrom: data.effectiveFrom,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockTargets.set(target.id, target);
        return target;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const t = mockTargets.get(where.id);
        if (!t) return null;
        const updated = { ...t, ...data, updatedAt: new Date() };
        mockTargets.set(t.id, updated);
        return updated;
      }),
    },
    meal: {
      findMany: vi.fn(async ({ where }: any) => {
        return Array.from(mockMeals.values()).filter((m) => m.userId === where.userId);
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

describe('FUEL Nutrition Targets API (/api/v1/fuel/targets & /summary/compare)', () => {
  const app = createApp();

  const userA = {
    id: 'usr_target_a',
    email: 'target_a@example.com',
    username: 'target_a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tokenA = signAccessToken({ id: userA.id, email: userA.email, username: userA.username });

  beforeEach(() => {
    mockUsers.clear();
    mockTargets.clear();
    mockMeals.clear();
    mockUsers.set(userA.id, userA);
  });

  it('should create a nutrition target with effectiveFrom date', async () => {
    const res = await request(app)
      .post('/api/v1/fuel/targets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        calories: 2200,
        protein: 160,
        carbohydrates: 220,
        fat: 65,
        effectiveFrom: '2026-08-01',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.calories).toBe(2200);
    expect(res.body.data.effectiveFrom).toBe('2026-08-01');
  });

  it('should reject creating target on duplicate effectiveFrom date with 409 CONFLICT', async () => {
    // First creation
    await request(app)
      .post('/api/v1/fuel/targets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        calories: 2200,
        protein: 160,
        carbohydrates: 220,
        fat: 65,
        effectiveFrom: '2026-08-01',
      });

    // Duplicate creation on same date
    const res = await request(app)
      .post('/api/v1/fuel/targets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        calories: 2500,
        protein: 180,
        carbohydrates: 250,
        fat: 70,
        effectiveFrom: '2026-08-01',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should reject PATCH on historical target (effectiveFrom <= today) with 409 CONFLICT', async () => {
    const createRes = await request(app)
      .post('/api/v1/fuel/targets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        calories: 2200,
        protein: 160,
        carbohydrates: 220,
        fat: 65,
        effectiveFrom: '2026-08-01', // In the past relative to 2026-08-17
      });

    const targetId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/fuel/targets/${targetId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ calories: 2500 });

    expect(patchRes.status).toBe(409);
    expect(patchRes.body.error.code).toBe('CONFLICT');
  });

  it('Target Comparison Test: compare actual intake against target and calculate remaining (including negative when over-target)', async () => {
    // 1. Create target 2000 kcal, 150 protein
    await request(app)
      .post('/api/v1/fuel/targets')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        calories: 2000,
        protein: 150,
        carbohydrates: 200,
        fat: 60,
        effectiveFrom: '2026-08-01',
      });

    // 2. Add meal for 2026-08-17 with 2200 kcal (200 kcal over target)
    const dStr = '2026-08-17';
    mockMeals.set('m_comp', {
      id: 'm_comp',
      userId: userA.id,
      name: 'Over-target Dinner',
      mealDate: new Date(dStr),
      entries: [
        { caloriesSnapshot: 2200, proteinSnapshot: 140, carbohydratesSnapshot: 200, fatSnapshot: 60, fiberSnapshot: null },
      ],
    });

    // 3. Query target comparison
    const res = await request(app)
      .get(`/api/v1/fuel/summary/compare?date=${dStr}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.actual.calories).toBe(2200);
    expect(res.body.data.target.calories).toBe(2000);
    expect(res.body.data.remaining.calories).toBe(-200); // 2000 - 2200 = -200
    expect(res.body.data.remaining.protein).toBe(10); // 150 - 140 = 10
  });
});
