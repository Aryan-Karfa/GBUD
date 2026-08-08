import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { hashPassword } from '../utils/password';
import { signAccessToken, hashRefreshToken } from '../utils/jwt';

// In-memory mock database store for deterministic test execution
const mockUsers = new Map<string, any>();
const mockSessions = new Map<string, any>();

vi.mock('../config/prisma', () => {
  const mockTx = {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.email) {
          for (const u of mockUsers.values()) {
            if (u.email.toLowerCase() === where.email.toLowerCase()) return u;
          }
        }
        if (where.username) {
          for (const u of mockUsers.values()) {
            if (u.username === where.username) return u;
          }
        }
        if (where.id) return mockUsers.get(where.id) || null;
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const user = {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email: data.email,
          username: data.username,
          passwordHash: data.passwordHash,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.set(user.id, user);
        return user;
      }),
    },
    session: {
      create: vi.fn(async ({ data }: any) => {
        const session = {
          id: `sess_${Math.random().toString(36).substring(2, 9)}`,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockSessions.set(session.id, session);
        return session;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        for (const s of mockSessions.values()) {
          if (s.tokenHash === where.tokenHash || s.id === where.id) {
            const user = mockUsers.get(s.userId);
            return { ...s, user };
          }
        }
        return null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        for (const [id, s] of mockSessions.entries()) {
          if (s.id === where.id || s.tokenHash === where.tokenHash) {
            const updated = { ...s, ...data };
            mockSessions.set(id, updated);
            return updated;
          }
        }
        return null;
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

describe('Authentication & Identity API (/api/v1/auth)', () => {
  const app = createApp();

  beforeEach(() => {
    mockUsers.clear();
    mockSessions.clear();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and return tokens without leaking passwordHash', async () => {
      const payload = {
        email: 'TestUser@Example.Com',
        username: 'testuser',
        password: 'securePassword123',
      };

      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('testuser@example.com');
      expect(res.body.data.user.username).toBe('testuser');
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();

      // Security check: confirm passwordHash and tokenHash are NEVER exposed
      expect(JSON.stringify(res.body)).not.toContain('passwordHash');
      expect(JSON.stringify(res.body)).not.toContain('tokenHash');
    });

    it('should return 409 CONFLICT if email is already registered', async () => {
      const existingHash = await hashPassword('password123');
      mockUsers.set('usr_1', {
        id: 'usr_1',
        email: 'existing@example.com',
        username: 'existinguser',
        passwordHash: existingHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'existing@example.com',
        username: 'newusername',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.message).toContain('Email already registered');
    });

    it('should return 409 CONFLICT if username is already taken', async () => {
      const existingHash = await hashPassword('password123');
      mockUsers.set('usr_1', {
        id: 'usr_1',
        email: 'user1@example.com',
        username: 'taken_user',
        passwordHash: existingHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'user2@example.com',
        username: 'taken_user',
        password: 'password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.message).toContain('Username already taken');
    });

    it('should return 422 VALIDATION_ERROR if password is under 8 characters', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'short@example.com',
        username: 'shortuser',
        password: '123',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate valid user credentials successfully', async () => {
      const pwdHash = await hashPassword('correctPassword123');
      mockUsers.set('usr_1', {
        id: 'usr_1',
        email: 'user@example.com',
        username: 'validuser',
        passwordHash: pwdHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'user@example.com',
        password: 'correctPassword123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe('usr_1');
      expect(res.body.data.tokens.accessToken).toBeDefined();
    });

    it('should return generic 401 UNAUTHORIZED when password is wrong', async () => {
      const pwdHash = await hashPassword('correctPassword123');
      mockUsers.set('usr_1', {
        id: 'usr_1',
        email: 'user@example.com',
        username: 'validuser',
        passwordHash: pwdHash,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'user@example.com',
        password: 'wrongPassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 401 UNAUTHORIZED when user account status is SUSPENDED', async () => {
      const pwdHash = await hashPassword('password123');
      mockUsers.set('usr_1', {
        id: 'usr_1',
        email: 'suspended@example.com',
        username: 'suspendeduser',
        passwordHash: pwdHash,
        status: 'SUSPENDED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'suspended@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 UNAUTHORIZED when Authorization header is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile when valid Bearer token is provided', async () => {
      const user = {
        id: 'usr_me',
        email: 'me@example.com',
        username: 'meuser',
        passwordHash: 'hash',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.set(user.id, user);

      const token = signAccessToken({ id: user.id, email: user.email, username: user.username });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('usr_me');
      expect(res.body.data.email).toBe('me@example.com');
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /api/v1/auth/refresh & Logout', () => {
    it('should rotate refresh token atomically and invalidate old token after logout', async () => {
      const user = {
        id: 'usr_ref',
        email: 'ref@example.com',
        username: 'refuser',
        passwordHash: 'hash',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.set(user.id, user);

      const rawRefreshToken = 'raw_refresh_token_123';
      const tokenHash = hashRefreshToken(rawRefreshToken);
      const futureExpiry = new Date();
      futureExpiry.setDate(futureExpiry.getDate() + 7);

      mockSessions.set('sess_1', {
        id: 'sess_1',
        userId: user.id,
        tokenHash,
        expiresAt: futureExpiry,
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 1. Test Refresh Rotation
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
      expect(refreshRes.body.data.tokens.refreshToken).toBeDefined();
      expect(refreshRes.body.data.tokens.refreshToken).not.toBe(rawRefreshToken);

      const newRefreshToken = refreshRes.body.data.tokens.refreshToken;

      // 2. Re-using old refresh token should fail with 401
      const reuseRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawRefreshToken });

      expect(reuseRes.status).toBe(401);

      // 3. Logout using new refresh token
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken: newRefreshToken });

      expect(logoutRes.status).toBe(200);

      // 4. Refreshing after logout should fail with 401
      const postLogoutRefresh = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: newRefreshToken });

      expect(postLogoutRefresh.status).toBe(401);
    });
  });
});
