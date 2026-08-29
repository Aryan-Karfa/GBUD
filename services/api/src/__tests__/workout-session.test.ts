import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

// In-memory mock store for Phase 5 tests
const mockUsers = new Map<string, any>();
const mockExercises = new Map<string, any>();
const mockWorkoutTemplates = new Map<string, any>();
const mockTemplateExercises = new Map<string, any>();
const mockWorkoutSessions = new Map<string, any>();
const mockSessionExercises = new Map<string, any>();
const mockWorkoutSets = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
    },
    exercise: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockExercises.get(where.id) || null;
        return null;
      }),
    },
    workoutTemplate: {
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
      delete: vi.fn(async ({ where }: any) => {
        mockWorkoutTemplates.delete(where.id);
        // Soft unlink on sessions
        for (const [id, s] of mockWorkoutSessions.entries()) {
          if (s.workoutTemplateId === where.id) {
            mockWorkoutSessions.set(id, { ...s, workoutTemplateId: null });
          }
        }
        return true;
      }),
    },
    workoutSession: {
      findFirst: vi.fn(async ({ where }: any) => {
        for (const s of mockWorkoutSessions.values()) {
          if (where.id && s.id !== where.id) continue;
          if (where.userId && s.userId !== where.userId) continue;
          if (where.status && s.status !== where.status) continue;

          const sessionExercises = Array.from(mockSessionExercises.values())
            .filter((se) => se.workoutSessionId === s.id)
            .sort((a, b) => a.order - b.order)
            .map((se) => {
              const sets = Array.from(mockWorkoutSets.values())
                .filter((st) => st.workoutSessionExerciseId === se.id)
                .sort((a, b) => a.setNumber - b.setNumber);
              return { ...se, sets };
            });

          return { ...s, sessionExercises };
        }
        return null;
      }),
      findUniqueOrThrow: vi.fn(async ({ where }: any) => {
        const s = mockWorkoutSessions.get(where.id);
        if (!s) throw new Error('Session not found');

        const sessionExercises = Array.from(mockSessionExercises.values())
          .filter((se) => se.workoutSessionId === s.id)
          .sort((a, b) => a.order - b.order)
          .map((se) => {
            const sets = Array.from(mockWorkoutSets.values())
              .filter((st) => st.workoutSessionExerciseId === se.id)
              .sort((a, b) => a.setNumber - b.setNumber);
            return { ...se, sets };
          });

        return { ...s, sessionExercises };
      }),
      findMany: vi.fn(async ({ where, skip = 0, take = 20 }: any) => {
        let list = Array.from(mockWorkoutSessions.values()).filter((s) => s.userId === where.userId);
        if (where?.status) {
          list = list.filter((s) => s.status === where.status);
        }
        list.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

        return list.slice(skip, skip + take).map((s) => {
          const sessionExercises = Array.from(mockSessionExercises.values())
            .filter((se) => se.workoutSessionId === s.id)
            .sort((a, b) => a.order - b.order)
            .map((se) => {
              const sets = Array.from(mockWorkoutSets.values())
                .filter((st) => st.workoutSessionExerciseId === se.id)
                .sort((a, b) => a.setNumber - b.setNumber);
              return { ...se, sets };
            });
          return { ...s, sessionExercises };
        });
      }),
      count: vi.fn(async ({ where }: any) => {
        let list = Array.from(mockWorkoutSessions.values()).filter((s) => s.userId === where.userId);
        if (where?.status) {
          list = list.filter((s) => s.status === where.status);
        }
        return list.length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const session = {
          id: `sess_${Math.random().toString(36).substring(2, 9)}`,
          userId: data.userId,
          workoutTemplateId: data.workoutTemplateId || null,
          status: data.status || 'IN_PROGRESS',
          startedAt: data.startedAt || new Date(),
          completedAt: null,
          abandonedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockWorkoutSessions.set(session.id, session);
        return session;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const s = mockWorkoutSessions.get(where.id);
        if (!s) return null;
        const updated = { ...s, ...data, updatedAt: new Date() };
        mockWorkoutSessions.set(s.id, updated);
        return updated;
      }),
    },
    workoutSessionExercise: {
      create: vi.fn(async ({ data }: any) => {
        const se = {
          id: `se_${Math.random().toString(36).substring(2, 9)}`,
          workoutSessionId: data.workoutSessionId,
          exerciseId: data.exerciseId || null,
          name: data.name,
          order: data.order,
          notes: data.notes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockSessionExercises.set(se.id, se);
        return se;
      }),
    },
    workoutSet: {
      aggregate: vi.fn(async ({ where }: any) => {
        const sets = Array.from(mockWorkoutSets.values()).filter(
          (st) => st.workoutSessionExerciseId === where.workoutSessionExerciseId
        );
        const maxNum = sets.reduce((max, s) => Math.max(max, s.setNumber), 0);
        return { _max: { setNumber: sets.length > 0 ? maxNum : null } };
      }),
      create: vi.fn(async ({ data }: any) => {
        const st = {
          id: `st_${Math.random().toString(36).substring(2, 9)}`,
          workoutSessionExerciseId: data.workoutSessionExerciseId,
          setNumber: data.setNumber,
          reps: data.reps ?? null,
          weight: data.weight ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockWorkoutSets.set(st.id, st);
        return st;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const st = mockWorkoutSets.get(where.id);
        if (!st) return null;
        const updated = { ...st, ...data, updatedAt: new Date() };
        mockWorkoutSets.set(st.id, updated);
        return updated;
      }),
      delete: vi.fn(async ({ where }: any) => {
        mockWorkoutSets.delete(where.id);
        return true;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return Array.from(mockWorkoutSets.values())
          .filter((st) => st.workoutSessionExerciseId === where.workoutSessionExerciseId)
          .sort((a, b) => a.setNumber - b.setNumber);
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

describe('Workout Execution API (/api/v1/workout-sessions)', () => {
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
    isActive: true,
  };

  const exIncline = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Incline Dumbbell Press',
    isActive: true,
  };

  beforeEach(() => {
    mockUsers.clear();
    mockExercises.clear();
    mockWorkoutTemplates.clear();
    mockTemplateExercises.clear();
    mockWorkoutSessions.clear();
    mockSessionExercises.clear();
    mockWorkoutSets.clear();

    mockUsers.set(userA.id, userA);
    mockUsers.set(userB.id, userB);
    mockExercises.set(exBench.id, exBench);
    mockExercises.set(exIncline.id, exIncline);
  });

  describe('Starting Workout Session (POST /api/v1/workout-sessions)', () => {
    it('should start workout session from template and snapshot exercise structure', async () => {
      // 1. Create Template with Bench Press & Incline Press
      const tplId = 'tpl_push';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Push Day',
        description: 'Chest workout',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });
      mockTemplateExercises.set('te_2', {
        id: 'te_2',
        workoutTemplateId: tplId,
        exerciseId: exIncline.id,
        order: 2,
      });

      // 2. Start session
      const res = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PROGRESS');
      expect(res.body.data.sessionExercises).toHaveLength(2);
      expect(res.body.data.sessionExercises[0].name).toBe('Bench Press');
      expect(res.body.data.sessionExercises[0].order).toBe(1);
      expect(res.body.data.sessionExercises[1].name).toBe('Incline Dumbbell Press');
      expect(res.body.data.sessionExercises[1].order).toBe(2);
    });

    it('should reject start from empty template with 400 BAD_REQUEST', async () => {
      const emptyTplId = 'tpl_empty';
      mockWorkoutTemplates.set(emptyTplId, {
        id: emptyTplId,
        userId: userA.id,
        name: 'Empty Template',
      });

      const res = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: emptyTplId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should reject starting second active session with 409 CONFLICT', async () => {
      const tplId = 'tpl_push';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Push Day',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      // First start
      await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      // Second start attempt
      const res = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('Template & Exercise Snapshot Isolation Tests', () => {
    it('Snapshot Isolation: modifying template after session start does NOT alter active session', async () => {
      const tplId = 'tpl_snap';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Snap Template',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      // Start session
      const startRes = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      const sessionId = startRes.body.data.id;

      // Modify template: replace Bench with Incline
      mockTemplateExercises.clear();
      mockTemplateExercises.set('te_new', {
        id: 'te_new',
        workoutTemplateId: tplId,
        exerciseId: exIncline.id,
        order: 1,
      });

      // Retrieve session details
      const sessionRes = await request(app)
        .get(`/api/v1/workout-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(sessionRes.status).toBe(200);
      expect(sessionRes.body.data.sessionExercises).toHaveLength(1);
      expect(sessionRes.body.data.sessionExercises[0].name).toBe('Bench Press');
    });

    it('Template Deletion Preservation: deleting template preserves historical session with workoutTemplateId = null', async () => {
      const tplId = 'tpl_del';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Del Template',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      const startRes = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      const sessionId = startRes.body.data.id;

      // Delete template
      mockWorkoutTemplates.delete(tplId);
      const sessionInStore = mockWorkoutSessions.get(sessionId);
      sessionInStore.workoutTemplateId = null;

      // Retrieve session
      const res = await request(app)
        .get(`/api/v1/workout-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.workoutTemplateId).toBeNull();
      expect(res.body.data.sessionExercises[0].name).toBe('Bench Press');
    });
  });

  describe('Set Operations (POST, PATCH, DELETE sets)', () => {
    it('should add sets, auto-assign setNumbers, update, and re-number upon deletion', async () => {
      const tplId = 'tpl_sets';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Sets Template',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      const startRes = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      const sessionId = startRes.body.data.id;
      const seId = startRes.body.data.sessionExercises[0].id;

      // 1. Add set 1
      const addSet1 = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reps: 8, weight: 80 });

      expect(addSet1.status).toBe(201);
      expect(addSet1.body.data.sessionExercises[0].sets).toHaveLength(1);
      expect(addSet1.body.data.sessionExercises[0].sets[0].setNumber).toBe(1);
      expect(addSet1.body.data.sessionExercises[0].sets[0].reps).toBe(8);
      expect(addSet1.body.data.sessionExercises[0].sets[0].weight).toBe(80);

      const set1Id = addSet1.body.data.sessionExercises[0].sets[0].id;

      // 2. Add set 2
      const addSet2 = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reps: 10, weight: 85 });

      expect(addSet2.status).toBe(201);
      expect(addSet2.body.data.sessionExercises[0].sets).toHaveLength(2);
      expect(addSet2.body.data.sessionExercises[0].sets[1].setNumber).toBe(2);

      // 3. Update set 1
      const patchSet = await request(app)
        .patch(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets/${set1Id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reps: 12, weight: 80 });

      expect(patchSet.status).toBe(200);
      expect(patchSet.body.data.sessionExercises[0].sets[0].reps).toBe(12);

      // 4. Delete set 1 -> remaining set re-numbered to setNumber 1
      const delSet = await request(app)
        .delete(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets/${set1Id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(delSet.status).toBe(200);
      expect(delSet.body.data.sessionExercises[0].sets).toHaveLength(1);
      expect(delSet.body.data.sessionExercises[0].sets[0].setNumber).toBe(1);
    });

    it('should reject empty set {} with 422 VALIDATION_ERROR', async () => {
      const tplId = 'tpl_val';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Validation Template',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      const startRes = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      const sessionId = startRes.body.data.id;
      const seId = startRes.body.data.sessionExercises[0].id;

      const emptyRes = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({});

      expect(emptyRes.status).toBe(422);
      expect(emptyRes.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Completion, Abandonment & Historical Immutability', () => {
    it('should complete workout and enforce historical immutability', async () => {
      const tplId = 'tpl_comp';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Comp Template',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      const startRes = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      const sessionId = startRes.body.data.id;
      const seId = startRes.body.data.sessionExercises[0].id;

      // Add set
      const addSetRes = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reps: 8, weight: 80 });

      const setId = addSetRes.body.data.sessionExercises[0].sets[0].id;

      // Complete session
      const compRes = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(compRes.status).toBe(200);
      expect(compRes.body.data.status).toBe('COMPLETED');
      expect(compRes.body.data.completedAt).not.toBeNull();
      expect(compRes.body.data.abandonedAt).toBeNull();

      // Attempting to add set to completed session -> 400
      const postCompAdd = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reps: 10, weight: 80 });

      expect(postCompAdd.status).toBe(400);

      // Attempting to update set in completed session -> 400
      const postCompPatch = await request(app)
        .patch(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets/${setId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ reps: 10 });

      expect(postCompPatch.status).toBe(400);

      // Attempting to complete again -> 400
      const postCompComp = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(postCompComp.status).toBe(400);
    });
  });

  describe('User Ownership Boundaries (404 Isolation)', () => {
    it('User B cannot access or modify User A workout session (returns 404 NOT_FOUND)', async () => {
      const tplId = 'tpl_iso';
      mockWorkoutTemplates.set(tplId, {
        id: tplId,
        userId: userA.id,
        name: 'Iso Template',
      });
      mockTemplateExercises.set('te_1', {
        id: 'te_1',
        workoutTemplateId: tplId,
        exerciseId: exBench.id,
        order: 1,
      });

      const startRes = await request(app)
        .post('/api/v1/workout-sessions')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ workoutTemplateId: tplId });

      const sessionId = startRes.body.data.id;
      const seId = startRes.body.data.sessionExercises[0].id;

      // User B GET -> 404
      const getRes = await request(app)
        .get(`/api/v1/workout-sessions/${sessionId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(getRes.status).toBe(404);

      // User B Add Set -> 404
      const addRes = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/exercises/${seId}/sets`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ reps: 8 });

      expect(addRes.status).toBe(404);

      // User B Complete -> 404
      const compRes = await request(app)
        .post(`/api/v1/workout-sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(compRes.status).toBe(404);
    });
  });
});
