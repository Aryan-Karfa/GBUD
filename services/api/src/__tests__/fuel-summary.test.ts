import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

const mockUsers = new Map<string, any>();
const mockMeals = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
    },
    meal: {
      findMany: vi.fn(async ({ where }: any) => {
        let list = Array.from(mockMeals.values()).filter((m) => m.userId === where.userId);

        if (where?.mealDate) {
          if (where.mealDate instanceof Date) {
            const dateStr = where.mealDate.toISOString().split('T')[0];
            list = list.filter((m) => m.mealDate.toISOString().split('T')[0] === dateStr);
          } else if (where.mealDate.gte || where.mealDate.lte) {
            if (where.mealDate.gte) {
              list = list.filter((m) => m.mealDate.getTime() >= where.mealDate.gte.getTime());
            }
            if (where.mealDate.lte) {
              list = list.filter((m) => m.mealDate.getTime() <= where.mealDate.lte.getTime());
            }
          }
        }

        return list;
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

describe('FUEL Summaries & History API (/api/v1/fuel/summary & /history)', () => {
  const app = createApp();

  const userA = {
    id: 'usr_summary_a',
    email: 'summary_a@example.com',
    username: 'summary_a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tokenA = signAccessToken({ id: userA.id, email: userA.email, username: userA.username });

  beforeEach(() => {
    mockUsers.clear();
    mockMeals.clear();
    mockUsers.set(userA.id, userA);
  });

  it('should return valid empty response when user has no meals on requested date', async () => {
    const res = await request(app)
      .get('/api/v1/fuel/summary?date=2026-08-17')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.date).toBe('2026-08-17');
    expect(res.body.data.calories).toBe(0);
    expect(res.body.data.protein).toBe(0);
    expect(res.body.data.meals).toBe(0);
  });

  it('should aggregate daily totals across breakfast, lunch, and dinner for requested date', async () => {
    const dStr = '2026-08-17';
    const dObj = new Date(dStr);

    const m1 = {
      id: 'm1',
      userId: userA.id,
      name: 'Breakfast',
      mealDate: dObj,
      entries: [
        { caloriesSnapshot: 500, proteinSnapshot: 30, carbohydratesSnapshot: 50, fatSnapshot: 15, fiberSnapshot: 5 },
      ],
    };

    const m2 = {
      id: 'm2',
      userId: userA.id,
      name: 'Lunch',
      mealDate: dObj,
      entries: [
        { caloriesSnapshot: 700, proteinSnapshot: 50, carbohydratesSnapshot: 70, fatSnapshot: 20, fiberSnapshot: 8 },
      ],
    };

    mockMeals.set(m1.id, m1);
    mockMeals.set(m2.id, m2);

    const res = await request(app)
      .get(`/api/v1/fuel/summary?date=${dStr}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.calories).toBe(1200);
    expect(res.body.data.protein).toBe(80);
    expect(res.body.data.carbohydrates).toBe(120);
    expect(res.body.data.fat).toBe(35);
    expect(res.body.data.fiber).toBe(13);
    expect(res.body.data.meals).toBe(2);
  });
});
