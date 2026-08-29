import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient, ApiClient } from '../index';

describe('Domain Endpoint Client Contracts', () => {
  const baseUrl = 'http://localhost:4000';
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: ApiClient;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: true, data: { ok: true } }),
    });

    client = createApiClient({ baseUrl, fetch: mockFetch as any });
  });

  describe('HEALTH Endpoint Client', () => {
    it('should call GET /api/v1/health', async () => {
      await client.health.healthCheck();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/health',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('TRAIN Endpoint Client', () => {
    it('should call exercise endpoints', async () => {
      await client.train.listExercises({ search: 'squat', page: 1, limit: 10 });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/exercises?search=squat&page=1&limit=10',
        expect.objectContaining({ method: 'GET' })
      );

      await client.train.getExercise('ex-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/exercises/ex-1',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should call workout template endpoints', async () => {
      await client.train.listWorkoutTemplates();
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates',
        expect.objectContaining({ method: 'GET' })
      );

      await client.train.getWorkoutTemplate('tpl-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates/tpl-1',
        expect.objectContaining({ method: 'GET' })
      );

      await client.train.createWorkoutTemplate({ name: 'Push' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates',
        expect.objectContaining({ method: 'POST', body: JSON.stringify({ name: 'Push' }) })
      );

      await client.train.updateWorkoutTemplate('tpl-1', { name: 'Push A' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates/tpl-1',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ name: 'Push A' }) })
      );

      await client.train.deleteWorkoutTemplate('tpl-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates/tpl-1',
        expect.objectContaining({ method: 'DELETE' })
      );

      await client.train.addExerciseToTemplate('tpl-1', { exerciseId: 'ex-1', notes: 'Warm up' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates/tpl-1/exercises',
        expect.objectContaining({ method: 'POST' })
      );

      await client.train.removeExerciseFromTemplate('tpl-1', 'te-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates/tpl-1/exercises/te-1',
        expect.objectContaining({ method: 'DELETE' })
      );

      await client.train.reorderTemplateExercises('tpl-1', { exerciseIds: ['ex-2', 'ex-1'] });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-templates/tpl-1/exercises/reorder',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('should call workout session & set endpoints', async () => {
      await client.train.startWorkoutSession({ workoutTemplateId: 'tpl-1' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions',
        expect.objectContaining({ method: 'POST' })
      );

      await client.train.getActiveWorkoutSession();
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/active',
        expect.objectContaining({ method: 'GET' })
      );

      await client.train.getWorkoutSession('sess-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/sess-1',
        expect.objectContaining({ method: 'GET' })
      );

      await client.train.listWorkoutHistory({ page: 1, limit: 10, status: 'COMPLETED' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions?page=1&limit=10&status=COMPLETED',
        expect.objectContaining({ method: 'GET' })
      );

      await client.train.addWorkoutSet('sess-1', 'se-1', { reps: 8, weight: 100 });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/sess-1/exercises/se-1/sets',
        expect.objectContaining({ method: 'POST' })
      );

      await client.train.updateWorkoutSet('sess-1', 'se-1', 'set-1', { reps: 10 });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/sess-1/exercises/se-1/sets/set-1',
        expect.objectContaining({ method: 'PATCH' })
      );

      await client.train.deleteWorkoutSet('sess-1', 'se-1', 'set-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/sess-1/exercises/se-1/sets/set-1',
        expect.objectContaining({ method: 'DELETE' })
      );

      await client.train.completeWorkoutSession('sess-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/sess-1/complete',
        expect.objectContaining({ method: 'POST' })
      );

      await client.train.abandonWorkoutSession('sess-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/workout-sessions/sess-1/abandon',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('PROGRESS Endpoint Client', () => {
    it('should call progress analytics endpoints', async () => {
      const range = { from: '2026-08-01', to: '2026-08-19' };

      await client.progress.getProgressSummary(range);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/summary?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getTrainingFrequency(range);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/frequency?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getVolumeSummary(range);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/volume?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getExerciseVolume(range);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/volume/exercises?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getMuscleVolume(range);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/volume/muscles?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getPersonalRecords(range);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/prs?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getExercisePerformance('ex-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/exercises/ex-1',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getExerciseTrend('ex-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/exercises/ex-1/trend',
        expect.objectContaining({ method: 'GET' })
      );

      await client.progress.getProgressDashboard();
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/progress/dashboard',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('FUEL Endpoint Client', () => {
    it('should call foods, meals, targets, and summary endpoints', async () => {
      await client.fuel.listFoods({ search: 'oats', page: 1, limit: 10 });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/foods?search=oats&page=1&limit=10',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.getFood('food-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/foods/food-1',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.createFood({
        name: 'Oatmeal',
        servingSize: 40,
        servingUnit: 'g',
        calories: 150,
        protein: 5,
        carbohydrates: 27,
        fat: 3,
      });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/foods',
        expect.objectContaining({ method: 'POST' })
      );

      await client.fuel.updateFood('food-1', { calories: 160 });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/foods/food-1',
        expect.objectContaining({ method: 'PATCH' })
      );

      await client.fuel.deleteFood('food-1');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/foods/food-1',
        expect.objectContaining({ method: 'DELETE' })
      );

      await client.fuel.createMeal({ name: 'Breakfast', mealDate: '2026-08-19' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/meals',
        expect.objectContaining({ method: 'POST' })
      );

      await client.fuel.listMeals({ mealDate: '2026-08-19' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/meals?mealDate=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.addMealFoodEntry('meal-1', { foodId: 'food-1', quantity: 2, unit: 'g' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/meals/meal-1/foods',
        expect.objectContaining({ method: 'POST' })
      );

      await client.fuel.getFuelSummary('2026-08-19');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/summary?date=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.compareFuelSummary('2026-08-19');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/summary/compare?date=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.getFuelHistory({ from: '2026-08-01', to: '2026-08-19' });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/history?from=2026-08-01&to=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.getCurrentNutritionTarget('2026-08-19');
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/targets/current?date=2026-08-19',
        expect.objectContaining({ method: 'GET' })
      );

      await client.fuel.createNutritionTarget({
        calories: 2500,
        protein: 180,
        carbohydrates: 300,
        fat: 70,
        effectiveFrom: '2026-08-19',
      });
      expect(mockFetch).toHaveBeenLastCalledWith(
        'http://localhost:4000/api/v1/fuel/targets',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
