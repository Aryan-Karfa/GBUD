import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fuelService } from '../features/fuel/services/fuel.service';
import { apiClient } from '../api/client';
import { NutritionTargetDTO } from '../features/fuel/fuel.types';

vi.mock('../api/client', () => ({
  apiClient: {
    fuel: {
      getCurrentNutritionTarget: vi.fn(),
      listNutritionTargets: vi.fn(),
      createNutritionTarget: vi.fn(),
      updateNutritionTarget: vi.fn(),
      deleteNutritionTarget: vi.fn(),
    },
  },
}));

describe('Date-Aware Nutrition Targets & Conflict Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves target applicable to the selected calendar date', async () => {
    const augustTarget: NutritionTargetDTO = {
      id: 'target-august',
      userId: 'user-1',
      calories: 2200,
      protein: 160,
      carbohydrates: 230,
      fat: 65,
      effectiveFrom: '2026-08-01',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
    };

    const septemberTarget: NutritionTargetDTO = {
      id: 'target-september',
      userId: 'user-1',
      calories: 2500,
      protein: 180,
      carbohydrates: 250,
      fat: 70,
      effectiveFrom: '2026-09-01',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    // When querying for an August date, returns August target
    (apiClient.fuel.getCurrentNutritionTarget as any).mockImplementation((date?: string) => {
      if (date && date < '2026-09-01') {
        return Promise.resolve(augustTarget);
      }
      return Promise.resolve(septemberTarget);
    });

    const pastResolved = await fuelService.getCurrentNutritionTarget('2026-08-15');
    expect(pastResolved?.calories).toBe(2200);
    expect(pastResolved?.effectiveFrom).toBe('2026-08-01');

    const currentResolved = await fuelService.getCurrentNutritionTarget('2026-09-03');
    expect(currentResolved?.calories).toBe(2500);
    expect(currentResolved?.effectiveFrom).toBe('2026-09-01');
  });

  it('preserves current target when a future effective target is created', async () => {
    const todayTarget: NutritionTargetDTO = {
      id: 'target-today',
      userId: 'user-1',
      calories: 2500,
      protein: 180,
      carbohydrates: 250,
      fat: 70,
      effectiveFrom: '2026-09-01',
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    const futureTarget: NutritionTargetDTO = {
      id: 'target-future',
      userId: 'user-1',
      calories: 2800,
      protein: 200,
      carbohydrates: 280,
      fat: 80,
      effectiveFrom: '2026-10-01',
      createdAt: '2026-09-03T10:00:00Z',
      updatedAt: '2026-09-03T10:00:00Z',
    };

    (apiClient.fuel.createNutritionTarget as any).mockResolvedValue(futureTarget);
    (apiClient.fuel.getCurrentNutritionTarget as any).mockImplementation((date?: string) => {
      if (date && date >= '2026-10-01') {
        return Promise.resolve(futureTarget);
      }
      return Promise.resolve(todayTarget);
    });

    // Create target for next month
    const created = await fuelService.createNutritionTarget({
      effectiveFrom: '2026-10-01',
      calories: 2800,
      protein: 200,
      carbohydrates: 280,
      fat: 80,
    });
    expect(created.id).toBe('target-future');

    // Effective target for today remains todayTarget
    const effectiveToday = await fuelService.getCurrentNutritionTarget('2026-09-03');
    expect(effectiveToday?.calories).toBe(2500);

    // Effective target for next month resolves to futureTarget
    const effectiveNextMonth = await fuelService.getCurrentNutritionTarget('2026-10-05');
    expect(effectiveNextMonth?.calories).toBe(2800);
  });

  it('rejects target creation when duplicate effectiveFrom conflict occurs', async () => {
    const conflictError: any = new Error('A nutrition target is already set for this effective date.');
    conflictError.status = 409;
    conflictError.code = 'CONFLICT';

    (apiClient.fuel.createNutritionTarget as any).mockRejectedValue(conflictError);

    await expect(
      fuelService.createNutritionTarget({
        effectiveFrom: '2026-09-01',
        calories: 2600,
        protein: 190,
        carbohydrates: 270,
        fat: 75,
      })
    ).rejects.toThrow('A nutrition target is already set for this effective date.');
  });
});
