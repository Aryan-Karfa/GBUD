import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

// In-memory mock database store for TRAIN tests
const mockUsers = new Map<string, any>();
const mockExercises = new Map<string, any>();
const mockWorkoutTemplates = new Map<string, any>();
const mockTemplateExercises = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
    },
    exercise: {
      findMany: vi.fn(async ({ where, skip = 0, take = 20 }: any) => {
        let results = Array.from(mockExercises.values()).filter((e) => e.isActive);
        if (where?.OR) {
          const search = where.OR[0].name.contains.toLowerCase();
          results = results.filter(
            (e) => e.name.toLowerCase().includes(search) || e.description?.toLowerCase().includes(search)
          );
        }
        if (where?.muscleGroup) {
          const group = where.muscleGroup.equals.toLowerCase();
          results = results.filter((e) => e.muscleGroup?.toLowerCase() === group);
        }
        return results.slice(skip, skip + take);
      }),
      count: vi.fn(async ({ where }: any) => {
        let results = Array.from(mockExercises.values()).filter((e) => e.isActive);
        if (where?.OR) {
          const search = where.OR[0].name.contains.toLowerCase();
          results = results.filter(
            (e) => e.name.toLowerCase().includes(search) || e.description?.toLowerCase().includes(search)
          );
        }
        return results.length;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockExercises.get(where.id) || null;
        return null;
      }),
    },
    workoutTemplate: {
      create: vi.fn(async ({ data }: any) => {
        const template = {
          id: `tpl_${Math.random().toString(36).substring(2, 9)}`,
          userId: data.userId,
          name: data.name,
          description: data.description || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockWorkoutTemplates.set(template.id, template);
        return { ...template, templateExercises: [] };
      }),
      findMany: vi.fn(async ({ where }: any) => {
        const list = Array.from(mockWorkoutTemplates.values())
          .filter((t) => t.userId === where.userId)
          .map((t) => {
            const items = Array.from(mockTemplateExercises.values())
              .filter((te) => te.workoutTemplateId === t.id)
              .sort((a, b) => a.order - b.order)
              .map((te) => ({
                ...te,
                exercise: mockExercises.get(te.exerciseId),
              }));
            return { ...t, templateExercises: items };
          });
        return list;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        const t = mockWorkoutTemplates.get(where.id);
        if (!t || (where.userId && t.userId !== where.userId)) return null;

        const items = Array.from(mockTemplateExercises.values())
          .filter((te) => te.workoutTemplateId === t.id)
          .sort((a, b) => a.order - b.order)
          .map((te) => ({
            ...te,
            exercise: mockExercises.get(te.exerciseId),
          }));

        return { ...t, templateExercises: items };
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const t = mockWorkoutTemplates.get(where.id);
        if (!t) return null;
        const updated = { ...t, ...data, updatedAt: new Date() };
        mockWorkoutTemplates.set(t.id, updated);

        const items = Array.from(mockTemplateExercises.values())
          .filter((te) => te.workoutTemplateId === t.id)
          .sort((a, b) => a.order - b.order)
          .map((te) => ({
            ...te,
            exercise: mockExercises.get(te.exerciseId),
          }));

        return { ...updated, templateExercises: items };
      }),
      delete: vi.fn(async ({ where }: any) => {
        mockWorkoutTemplates.delete(where.id);
        for (const [id, te] of mockTemplateExercises.entries()) {
          if (te.workoutTemplateId === where.id) {
            mockTemplateExercises.delete(id);
          }
        }
        return true;
      }),
    },
    workoutTemplateExercise: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.workoutTemplateId_exerciseId) {
          for (const te of mockTemplateExercises.values()) {
            if (
              te.workoutTemplateId === where.workoutTemplateId_exerciseId.workoutTemplateId &&
              te.exerciseId === where.workoutTemplateId_exerciseId.exerciseId
            ) {
              return te;
            }
          }
        }
        return null;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        for (const te of mockTemplateExercises.values()) {
          if (te.id === where.id && te.workoutTemplateId === where.workoutTemplateId) {
            return te;
          }
        }
        return null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return Array.from(mockTemplateExercises.values())
          .filter((te) => te.workoutTemplateId === where.workoutTemplateId)
          .sort((a, b) => a.order - b.order);
      }),
      aggregate: vi.fn(async ({ where }: any) => {
        const items = Array.from(mockTemplateExercises.values()).filter(
          (te) => te.workoutTemplateId === where.workoutTemplateId
        );
        const maxOrder = items.reduce((max, item) => Math.max(max, item.order), 0);
        return { _max: { order: items.length > 0 ? maxOrder : null } };
      }),
      create: vi.fn(async ({ data }: any) => {
        const te = {
          id: `te_${Math.random().toString(36).substring(2, 9)}`,
          workoutTemplateId: data.workoutTemplateId,
          exerciseId: data.exerciseId,
          order: data.order,
          notes: data.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockTemplateExercises.set(te.id, te);
        return te;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const te = mockTemplateExercises.get(where.id);
        if (!te) return null;
        const updated = { ...te, ...data, updatedAt: new Date() };
        mockTemplateExercises.set(te.id, updated);
        return updated;
      }),
      delete: vi.fn(async ({ where }: any) => {
        mockTemplateExercises.delete(where.id);
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

describe('TRAIN Domain API (/api/v1/exercises & /api/v1/workout-templates)', () => {
  const app = createApp();

  const userA = {
    id: 'usr_a',
    email: 'usera@example.com',
    username: 'usera',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userB = {
    id: 'usr_b',
    email: 'userb@example.com',
    username: 'userb',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tokenA = signAccessToken({ id: userA.id, email: userA.email, username: userA.username });
  const tokenB = signAccessToken({ id: userB.id, email: userB.email, username: userB.username });

  const exBench = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Bench Press',
    description: 'Flat bench press',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    movementPattern: 'Horizontal Push',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Press bar up',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const exSquat = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Squat',
    description: 'Back squat',
    muscleGroup: 'Quadriceps',
    equipment: 'Barbell',
    movementPattern: 'Squat',
    exerciseType: 'WEIGHT_REPS',
    instructions: 'Squat down',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUsers.clear();
    mockExercises.clear();
    mockWorkoutTemplates.clear();
    mockTemplateExercises.clear();

    mockUsers.set(userA.id, userA);
    mockUsers.set(userB.id, userB);
    mockExercises.set(exBench.id, exBench);
    mockExercises.set(exSquat.id, exSquat);
  });

  describe('Exercise Catalog API (/api/v1/exercises)', () => {
    it('GET /api/v1/exercises should return paginated catalog', async () => {
      const res = await request(app).get('/api/v1/exercises');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it('GET /api/v1/exercises?search=bench should filter exercises', async () => {
      const res = await request(app).get('/api/v1/exercises?search=bench');

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe('Bench Press');
    });

    it('GET /api/v1/exercises/:id should return single exercise details', async () => {
      const res = await request(app).get(`/api/v1/exercises/${exBench.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(exBench.id);
      expect(res.body.data.name).toBe('Bench Press');
    });

    it('GET /api/v1/exercises/:id for invalid id should return 404 NOT_FOUND', async () => {
      const res = await request(app).get('/api/v1/exercises/550e8400-e29b-41d4-a716-446655440999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Workout Template CRUD & Authorization (/api/v1/workout-templates)', () => {
    it('POST /api/v1/workout-templates should fail with 401 if unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/workout-templates')
        .send({ name: 'Push Day' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('POST /api/v1/workout-templates should create template for authenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Push Day', description: 'Chest & Shoulders' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Push Day');
      expect(res.body.data.userId).toBe(userA.id);
      expect(res.body.data.exercises).toEqual([]);
    });

    it('GET /api/v1/workout-templates should return only templates owned by user', async () => {
      await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'User A Push Day' });

      await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'User B Leg Day' });

      const resA = await request(app)
        .get('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(resA.status).toBe(200);
      expect(resA.body.data).toHaveLength(1);
      expect(resA.body.data[0].name).toBe('User A Push Day');
    });

    it('PATCH & DELETE should allow owner to modify/delete template', async () => {
      const createRes = await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Initial Push Day' });

      const tplId = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Updated Push Day' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.name).toBe('Updated Push Day');

      const delRes = await request(app)
        .delete(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(delRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(getRes.status).toBe(404);
    });
  });

  describe('Template Exercises Management & Ordering', () => {
    it('should add exercises, reorder them, and enforce sequential ordering', async () => {
      const createRes = await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Full Body' });

      const tplId = createRes.body.data.id;

      const add1 = await request(app)
        .post(`/api/v1/workout-templates/${tplId}/exercises`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ exerciseId: exBench.id });

      expect(add1.status).toBe(201);
      expect(add1.body.data.exercises).toHaveLength(1);
      expect(add1.body.data.exercises[0].order).toBe(1);

      const add2 = await request(app)
        .post(`/api/v1/workout-templates/${tplId}/exercises`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ exerciseId: exSquat.id });

      expect(add2.status).toBe(201);
      expect(add2.body.data.exercises).toHaveLength(2);
      expect(add2.body.data.exercises[1].order).toBe(2);

      const te1Id = add2.body.data.exercises[0].id;
      const te2Id = add2.body.data.exercises[1].id;

      const reorderRes = await request(app)
        .patch(`/api/v1/workout-templates/${tplId}/exercises/reorder`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ exerciseIds: [te2Id, te1Id] });

      expect(reorderRes.status).toBe(200);
      expect(reorderRes.body.data.exercises[0].id).toBe(te2Id);
      expect(reorderRes.body.data.exercises[0].order).toBe(1);
      expect(reorderRes.body.data.exercises[1].id).toBe(te1Id);
      expect(reorderRes.body.data.exercises[1].order).toBe(2);

      const removeRes = await request(app)
        .delete(`/api/v1/workout-templates/${tplId}/exercises/${te1Id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(removeRes.status).toBe(200);
      expect(removeRes.body.data.exercises).toHaveLength(1);
      expect(removeRes.body.data.exercises[0].id).toBe(te2Id);
      expect(removeRes.body.data.exercises[0].order).toBe(1);
    });

    it('should reject duplicate exercise addition with 409 CONFLICT', async () => {
      const createRes = await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Chest Day' });

      const tplId = createRes.body.data.id;

      await request(app)
        .post(`/api/v1/workout-templates/${tplId}/exercises`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ exerciseId: exBench.id });

      const dupRes = await request(app)
        .post(`/api/v1/workout-templates/${tplId}/exercises`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ exerciseId: exBench.id });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error.code).toBe('CONFLICT');
    });
  });

  describe('User Ownership Boundaries (404 Isolation)', () => {
    it('User B cannot access or modify User A template (returns 404 NOT_FOUND)', async () => {
      const createRes = await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'User A Private Template' });

      const tplId = createRes.body.data.id;

      const getRes = await request(app)
        .get(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(getRes.status).toBe(404);
      expect(getRes.body.error.code).toBe('NOT_FOUND');

      const patchRes = await request(app)
        .patch(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hacked Name' });

      expect(patchRes.status).toBe(404);

      const delRes = await request(app)
        .delete(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(delRes.status).toBe(404);

      const addRes = await request(app)
        .post(`/api/v1/workout-templates/${tplId}/exercises`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ exerciseId: exBench.id });

      expect(addRes.status).toBe(404);
    });
  });

  describe('Database Cascade & Exercise Integrity', () => {
    it('Deleting a template removes template exercise relationships but keeps catalog Exercise intact', async () => {
      const createRes = await request(app)
        .post('/api/v1/workout-templates')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Temp Template' });

      const tplId = createRes.body.data.id;

      await request(app)
        .post(`/api/v1/workout-templates/${tplId}/exercises`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ exerciseId: exBench.id });

      await request(app)
        .delete(`/api/v1/workout-templates/${tplId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      const exerciseRes = await request(app).get(`/api/v1/exercises/${exBench.id}`);
      expect(exerciseRes.status).toBe(200);
      expect(exerciseRes.body.data.id).toBe(exBench.id);
    });
  });
});
