"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
// In-memory mock database store for deterministic test execution
const mockUsers = new Map();
const mockSessions = new Map();
vitest_1.vi.mock('../config/prisma', () => {
    const mockTx = {
        user: {
            findUnique: vitest_1.vi.fn(async ({ where }) => {
                if (where.email) {
                    for (const u of mockUsers.values()) {
                        if (u.email.toLowerCase() === where.email.toLowerCase())
                            return u;
                    }
                }
                if (where.username) {
                    for (const u of mockUsers.values()) {
                        if (u.username === where.username)
                            return u;
                    }
                }
                if (where.id)
                    return mockUsers.get(where.id) || null;
                return null;
            }),
            create: vitest_1.vi.fn(async ({ data }) => {
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
            create: vitest_1.vi.fn(async ({ data }) => {
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
            findUnique: vitest_1.vi.fn(async ({ where }) => {
                for (const s of mockSessions.values()) {
                    if (s.tokenHash === where.tokenHash || s.id === where.id) {
                        const user = mockUsers.get(s.userId);
                        return { ...s, user };
                    }
                }
                return null;
            }),
            update: vitest_1.vi.fn(async ({ where, data }) => {
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
            $transaction: vitest_1.vi.fn(async (cb) => cb(mockTx)),
        },
    };
});
(0, vitest_1.describe)('Authentication & Identity API (/api/v1/auth)', () => {
    const app = (0, app_1.createApp)();
    (0, vitest_1.beforeEach)(() => {
        mockUsers.clear();
        mockSessions.clear();
    });
    (0, vitest_1.describe)('POST /api/v1/auth/register', () => {
        (0, vitest_1.it)('should register a new user successfully and return tokens without leaking passwordHash', async () => {
            const payload = {
                email: 'TestUser@Example.Com',
                username: 'testuser',
                password: 'securePassword123',
            };
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/register').send(payload);
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.user.email).toBe('testuser@example.com');
            (0, vitest_1.expect)(res.body.data.user.username).toBe('testuser');
            (0, vitest_1.expect)(res.body.data.tokens.accessToken).toBeDefined();
            (0, vitest_1.expect)(res.body.data.tokens.refreshToken).toBeDefined();
            // Security check: confirm passwordHash and tokenHash are NEVER exposed
            (0, vitest_1.expect)(JSON.stringify(res.body)).not.toContain('passwordHash');
            (0, vitest_1.expect)(JSON.stringify(res.body)).not.toContain('tokenHash');
        });
        (0, vitest_1.it)('should return 409 CONFLICT if email is already registered', async () => {
            const existingHash = await (0, password_1.hashPassword)('password123');
            mockUsers.set('usr_1', {
                id: 'usr_1',
                email: 'existing@example.com',
                username: 'existinguser',
                passwordHash: existingHash,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/register').send({
                email: 'existing@example.com',
                username: 'newusername',
                password: 'password123',
            });
            (0, vitest_1.expect)(res.status).toBe(409);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error.code).toBe('CONFLICT');
            (0, vitest_1.expect)(res.body.message).toContain('Email already registered');
        });
        (0, vitest_1.it)('should return 409 CONFLICT if username is already taken', async () => {
            const existingHash = await (0, password_1.hashPassword)('password123');
            mockUsers.set('usr_1', {
                id: 'usr_1',
                email: 'user1@example.com',
                username: 'taken_user',
                passwordHash: existingHash,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/register').send({
                email: 'user2@example.com',
                username: 'taken_user',
                password: 'password123',
            });
            (0, vitest_1.expect)(res.status).toBe(409);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error.code).toBe('CONFLICT');
            (0, vitest_1.expect)(res.body.message).toContain('Username already taken');
        });
        (0, vitest_1.it)('should return 422 VALIDATION_ERROR if password is under 8 characters', async () => {
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/register').send({
                email: 'short@example.com',
                username: 'shortuser',
                password: '123',
            });
            (0, vitest_1.expect)(res.status).toBe(422);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error.code).toBe('VALIDATION_ERROR');
        });
    });
    (0, vitest_1.describe)('POST /api/v1/auth/login', () => {
        (0, vitest_1.it)('should authenticate valid user credentials successfully', async () => {
            const pwdHash = await (0, password_1.hashPassword)('correctPassword123');
            mockUsers.set('usr_1', {
                id: 'usr_1',
                email: 'user@example.com',
                username: 'validuser',
                passwordHash: pwdHash,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({
                email: 'user@example.com',
                password: 'correctPassword123',
            });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.user.id).toBe('usr_1');
            (0, vitest_1.expect)(res.body.data.tokens.accessToken).toBeDefined();
        });
        (0, vitest_1.it)('should return generic 401 UNAUTHORIZED when password is wrong', async () => {
            const pwdHash = await (0, password_1.hashPassword)('correctPassword123');
            mockUsers.set('usr_1', {
                id: 'usr_1',
                email: 'user@example.com',
                username: 'validuser',
                passwordHash: pwdHash,
                status: 'ACTIVE',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({
                email: 'user@example.com',
                password: 'wrongPassword123',
            });
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error.code).toBe('UNAUTHORIZED');
            (0, vitest_1.expect)(res.body.message).toBe('Invalid email or password');
        });
        (0, vitest_1.it)('should return 401 UNAUTHORIZED when user account status is SUSPENDED', async () => {
            const pwdHash = await (0, password_1.hashPassword)('password123');
            mockUsers.set('usr_1', {
                id: 'usr_1',
                email: 'suspended@example.com',
                username: 'suspendeduser',
                passwordHash: pwdHash,
                status: 'SUSPENDED',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await (0, supertest_1.default)(app).post('/api/v1/auth/login').send({
                email: 'suspended@example.com',
                password: 'password123',
            });
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
            (0, vitest_1.expect)(res.body.error.code).toBe('UNAUTHORIZED');
        });
    });
    (0, vitest_1.describe)('GET /api/v1/auth/me', () => {
        (0, vitest_1.it)('should return 401 UNAUTHORIZED when Authorization header is missing', async () => {
            const res = await (0, supertest_1.default)(app).get('/api/v1/auth/me');
            (0, vitest_1.expect)(res.status).toBe(401);
            (0, vitest_1.expect)(res.body.success).toBe(false);
        });
        (0, vitest_1.it)('should return user profile when valid Bearer token is provided', async () => {
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
            const token = (0, jwt_1.signAccessToken)({ id: user.id, email: user.email, username: user.username });
            const res = await (0, supertest_1.default)(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${token}`);
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.id).toBe('usr_me');
            (0, vitest_1.expect)(res.body.data.email).toBe('me@example.com');
            (0, vitest_1.expect)(res.body.data).not.toHaveProperty('passwordHash');
        });
    });
    (0, vitest_1.describe)('POST /api/v1/auth/refresh & Logout', () => {
        (0, vitest_1.it)('should rotate refresh token atomically and invalidate old token after logout', async () => {
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
            const tokenHash = (0, jwt_1.hashRefreshToken)(rawRefreshToken);
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
            const refreshRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: rawRefreshToken });
            (0, vitest_1.expect)(refreshRes.status).toBe(200);
            (0, vitest_1.expect)(refreshRes.body.success).toBe(true);
            (0, vitest_1.expect)(refreshRes.body.data.tokens.accessToken).toBeDefined();
            (0, vitest_1.expect)(refreshRes.body.data.tokens.refreshToken).toBeDefined();
            (0, vitest_1.expect)(refreshRes.body.data.tokens.refreshToken).not.toBe(rawRefreshToken);
            const newRefreshToken = refreshRes.body.data.tokens.refreshToken;
            // 2. Re-using old refresh token should fail with 401
            const reuseRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: rawRefreshToken });
            (0, vitest_1.expect)(reuseRes.status).toBe(401);
            // 3. Logout using new refresh token
            const logoutRes = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/logout')
                .send({ refreshToken: newRefreshToken });
            (0, vitest_1.expect)(logoutRes.status).toBe(200);
            // 4. Refreshing after logout should fail with 401
            const postLogoutRefresh = await (0, supertest_1.default)(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken: newRefreshToken });
            (0, vitest_1.expect)(postLogoutRefresh.status).toBe(401);
        });
    });
});
//# sourceMappingURL=auth.test.js.map