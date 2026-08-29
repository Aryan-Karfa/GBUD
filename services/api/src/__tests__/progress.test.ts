import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { signAccessToken } from '../utils/jwt';

// In-memory mock stores
const mockUsers = new Map<string, any>();
const mockExercises = new Map<string, any>();
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
    workoutSession: {
      findMany: vi.fn(async ({ where, orderBy }: any) => {
        let list = Array.from(mockWorkoutSessions.values()).filter((s) => s.userId === where.userId);

        if (where?.status) {
          if (typeof where.status === 'string') {
            list = list.filter((s) => s.status === where.status);
          } else if (where.status.in) {
            list = list.filter((s) => where.status.in.includes(s.status));
          }
        }

        if (where?.startedAt) {
          if (where.startedAt.gte) {
            list = list.filter((s) => s.startedAt.getTime() >= where.startedAt.gte.getTime());
          }
          if (where.startedAt.lte) {
            list = list.filter((s) => s.startedAt.getTime() <= where.startedAt.lte.getTime());
          }
        }

        if (where?.sessionExercises?.some) {
          const someCond = where.sessionExercises.some;
          list = list.filter((s) => {
            const ses = Array.from(mockSessionExercises.values()).filter((se) => se.workoutSessionId === s.id);
            return ses.some((se) => {
              if (someCond.OR) {
                return someCond.OR.some((cond: any) => {
                  if (cond.exerciseId) return se.exerciseId === cond.exerciseId;
                  if (cond.name?.equals) return se.name.toLowerCase() === cond.name.equals.toLowerCase();
                  return false;
                });
              }
              return false;
            });
          });
        }

        if (orderBy?.startedAt === 'asc') {
          list.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
        } else if (orderBy?.startedAt === 'desc') {
          list.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
        }

        return list.map((s) => {
          const sessionExercises = Array.from(mockSessionExercises.values())
            .filter((se) => se.workoutSessionId === s.id)
            .sort((a, b) => a.order - b.order)
            .map((se) => {
              const sets = Array.from(mockWorkoutSets.values())
                .filter((st) => st.workoutSessionExerciseId === se.id)
                .sort((a, b) => a.setNumber - b.setNumber);
              const exercise = se.exerciseId ? mockExercises.get(se.exerciseId) || null : null;
              return { ...se, exercise, sets };
            });
          return { ...s, sessionExercises };
        });
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

describe('Progress & Analytics API (/api/v1/progress)', () => {
  const app = createApp();

  const userA = {
    id: 'usr_progress_a',
    email: 'prog_a@example.com',
    username: 'prog_a',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userB = {
    id: 'usr_progress_b',
    email: 'prog_b@example.com',
    username: 'prog_b',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const tokenA = signAccessToken({ id: userA.id, email: userA.email, username: userA.username });
  const tokenB = signAccessToken({ id: userB.id, email: userB.email, username: userB.username });

  const exBench = {
    id: 'ex_bench_id',
    name: 'Bench Press',
    muscleGroup: 'CHEST',
    isActive: true,
  };

  const exSquat = {
    id: 'ex_squat_id',
    name: 'Squat',
    muscleGroup: 'LEGS',
    isActive: true,
  };

  beforeEach(() => {
    mockUsers.clear();
    mockExercises.clear();
    mockWorkoutSessions.clear();
    mockSessionExercises.clear();
    mockWorkoutSets.clear();

    mockUsers.set(userA.id, userA);
    mockUsers.set(userB.id, userB);
    mockExercises.set(exBench.id, exBench);
    mockExercises.set(exSquat.id, exSquat);
  });

  describe('Progress Summary & Training Frequency', () => {
    it('should aggregate summary & frequency correctly (2 workouts on Monday = 1 training day)', async () => {
      const monDate = new Date('2026-08-03T10:00:00Z'); // Monday
      const monDate2 = new Date('2026-08-03T16:00:00Z'); // Monday 2nd workout
      const tueDate = new Date('2026-08-04T10:00:00Z'); // Tuesday

      // Session 1 (User A) - Completed
      const s1 = { id: 's1', userId: userA.id, status: 'COMPLETED', startedAt: monDate, completedAt: new Date(monDate.getTime() + 3600000) };
      // Session 2 (User A) - Completed on same Monday
      const s2 = { id: 's2', userId: userA.id, status: 'COMPLETED', startedAt: monDate2, completedAt: new Date(monDate2.getTime() + 1800000) };
      // Session 3 (User A) - Abandoned on Tuesday
      const s3 = { id: 's3', userId: userA.id, status: 'ABANDONED', startedAt: tueDate, abandonedAt: new Date(tueDate.getTime() + 600000) };

      mockWorkoutSessions.set(s1.id, s1);
      mockWorkoutSessions.set(s2.id, s2);
      mockWorkoutSessions.set(s3.id, s3);

      // Session 1 exercise & sets
      mockSessionExercises.set('se1', { id: 'se1', workoutSessionId: s1.id, exerciseId: exBench.id, name: exBench.name, order: 1 });
      mockWorkoutSets.set('st1', { id: 'st1', workoutSessionExerciseId: 'se1', setNumber: 1, reps: 8, weight: 80 }); // 640
      mockWorkoutSets.set('st2', { id: 'st2', workoutSessionExerciseId: 'se1', setNumber: 2, reps: 5, weight: 85 }); // 425

      // Summary API
      const res = await request(app)
        .get('/api/v1/progress/summary')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalWorkouts).toBe(3);
      expect(res.body.data.completedWorkouts).toBe(2);
      expect(res.body.data.abandonedWorkouts).toBe(1);
      expect(res.body.data.trainingDays).toBe(2); // Mon & Tue
      expect(res.body.data.totalSets).toBe(2);
      expect(res.body.data.totalReps).toBe(13);
      expect(res.body.data.totalVolume).toBe(1065);
    });
  });

  describe('GBUD-Derived Personal Records & Exclusions', () => {
    it('should derive PRs only from COMPLETED workouts and exclude ABANDONED workouts', async () => {
      const d1 = new Date('2026-08-01T10:00:00Z');
      const d2 = new Date('2026-08-05T10:00:00Z');

      // Completed Session -> Bench Press 100kg x 5 (1RM: 116.67)
      const sComp = { id: 's_comp', userId: userA.id, status: 'COMPLETED', startedAt: d1, completedAt: d1 };
      mockWorkoutSessions.set(sComp.id, sComp);
      mockSessionExercises.set('se_c', { id: 'se_c', workoutSessionId: sComp.id, exerciseId: exBench.id, name: exBench.name, order: 1 });
      mockWorkoutSets.set('st_c', { id: 'st_c', workoutSessionExerciseId: 'se_c', setNumber: 1, reps: 5, weight: 100 });

      // Abandoned Session -> Bench Press 150kg x 10 (Should be EXCLUDED!)
      const sAban = { id: 's_aban', userId: userA.id, status: 'ABANDONED', startedAt: d2, abandonedAt: d2 };
      mockWorkoutSessions.set(sAban.id, sAban);
      mockSessionExercises.set('se_a', { id: 'se_a', workoutSessionId: sAban.id, exerciseId: exBench.id, name: exBench.name, order: 1 });
      mockWorkoutSets.set('st_a', { id: 'st_a', workoutSessionExerciseId: 'se_a', setNumber: 1, reps: 10, weight: 150 });

      const res = await request(app)
        .get('/api/v1/progress/prs')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].exerciseName).toBe('Bench Press');
      expect(res.body.data[0].maxWeight).toBe(100);
      expect(res.body.data[0].estimated1RM).toBe(116.67);
    });
  });

  describe('User Ownership Isolation Test', () => {
    it('User B progress request contains ONLY User B data and 0 User A data', async () => {
      const d1 = new Date('2026-08-01T10:00:00Z');

      // User A completed workout
      const sA = { id: 's_user_a', userId: userA.id, status: 'COMPLETED', startedAt: d1, completedAt: d1 };
      mockWorkoutSessions.set(sA.id, sA);
      mockSessionExercises.set('se_user_a', { id: 'se_user_a', workoutSessionId: sA.id, exerciseId: exBench.id, name: exBench.name, order: 1 });
      mockWorkoutSets.set('st_user_a', { id: 'st_user_a', workoutSessionExerciseId: 'se_user_a', setNumber: 1, reps: 10, weight: 100 }); // 1000

      // User B has no workouts
      const resB = await request(app)
        .get('/api/v1/progress/summary')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(resB.status).toBe(200);
      expect(resB.body.data.totalWorkouts).toBe(0);
      expect(resB.body.data.totalVolume).toBe(0);

      const prsB = await request(app)
        .get('/api/v1/progress/prs')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(prsB.status).toBe(200);
      expect(prsB.body.data).toHaveLength(0);
    });
  });

  describe('Exercise Trend Chronological Order', () => {
    it('should return exercise trend points ordered chronologically (oldest -> newest)', async () => {
      const d1 = new Date('2026-08-01T10:00:00Z');
      const d2 = new Date('2026-08-08T10:00:00Z');

      const s1 = { id: 'st_1', userId: userA.id, status: 'COMPLETED', startedAt: d1, completedAt: d1 };
      const s2 = { id: 'st_2', userId: userA.id, status: 'COMPLETED', startedAt: d2, completedAt: d2 };

      mockWorkoutSessions.set(s1.id, s1);
      mockWorkoutSessions.set(s2.id, s2);

      mockSessionExercises.set('se_tr1', { id: 'se_tr1', workoutSessionId: s1.id, exerciseId: exBench.id, name: exBench.name, order: 1 });
      mockWorkoutSets.set('st_tr1', { id: 'st_tr1', workoutSessionExerciseId: 'se_tr1', setNumber: 1, reps: 8, weight: 80 });

      mockSessionExercises.set('se_tr2', { id: 'se_tr2', workoutSessionId: s2.id, exerciseId: exBench.id, name: exBench.name, order: 1 });
      mockWorkoutSets.set('st_tr2', { id: 'st_tr2', workoutSessionExerciseId: 'se_tr2', setNumber: 1, reps: 8, weight: 85 });

      const res = await request(app)
        .get(`/api/v1/progress/exercises/${exBench.id}/trend`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].date).toBe('2026-08-01');
      expect(res.body.data[0].bestWeight).toBe(80);
      expect(res.body.data[1].date).toBe('2026-08-08');
      expect(res.body.data[1].bestWeight).toBe(85);
    });
  });
});
