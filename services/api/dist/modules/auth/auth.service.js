"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_repository_1 = require("../../repositories/user.repository");
const session_repository_1 = require("../../repositories/session.repository");
const password_1 = require("../../utils/password");
const jwt_1 = require("../../utils/jwt");
const app_error_1 = require("../../utils/app-error");
const prisma_1 = require("../../config/prisma");
class AuthService {
    calculateRefreshExpiry() {
        const days = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        return expiresAt;
    }
    mapUserToDTO(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
    async register(input) {
        const existingEmail = await user_repository_1.userRepository.findByEmail(input.email);
        if (existingEmail) {
            throw app_error_1.AppError.conflict('Email already registered');
        }
        const existingUsername = await user_repository_1.userRepository.findByUsername(input.username);
        if (existingUsername) {
            throw app_error_1.AppError.conflict('Username already taken');
        }
        const passwordHash = await (0, password_1.hashPassword)(input.password);
        const rawRefreshToken = (0, jwt_1.generateRefreshToken)();
        const tokenHash = (0, jwt_1.hashRefreshToken)(rawRefreshToken);
        const expiresAt = this.calculateRefreshExpiry();
        const { user } = await prisma_1.prisma.$transaction(async (tx) => {
            const createdUser = await user_repository_1.userRepository.create({
                email: input.email,
                username: input.username,
                passwordHash,
            }, tx);
            await session_repository_1.sessionRepository.create({
                userId: createdUser.id,
                tokenHash,
                expiresAt,
            }, tx);
            return { user: createdUser };
        });
        const accessToken = (0, jwt_1.signAccessToken)({ id: user.id, email: user.email, username: user.username });
        return {
            user: this.mapUserToDTO(user),
            tokens: {
                accessToken,
                refreshToken: rawRefreshToken,
            },
        };
    }
    async login(input) {
        const user = await user_repository_1.userRepository.findByEmail(input.email);
        if (!user || user.status !== 'ACTIVE') {
            throw app_error_1.AppError.unauthorized('Invalid email or password');
        }
        const isPasswordValid = await (0, password_1.verifyPassword)(input.password, user.passwordHash);
        if (!isPasswordValid) {
            throw app_error_1.AppError.unauthorized('Invalid email or password');
        }
        const rawRefreshToken = (0, jwt_1.generateRefreshToken)();
        const tokenHash = (0, jwt_1.hashRefreshToken)(rawRefreshToken);
        const expiresAt = this.calculateRefreshExpiry();
        await session_repository_1.sessionRepository.create({
            userId: user.id,
            tokenHash,
            expiresAt,
        });
        const accessToken = (0, jwt_1.signAccessToken)({ id: user.id, email: user.email, username: user.username });
        return {
            user: this.mapUserToDTO(user),
            tokens: {
                accessToken,
                refreshToken: rawRefreshToken,
            },
        };
    }
    async refreshToken(refreshToken) {
        const oldTokenHash = (0, jwt_1.hashRefreshToken)(refreshToken);
        const newRawRefreshToken = (0, jwt_1.generateRefreshToken)();
        const newTokenHash = (0, jwt_1.hashRefreshToken)(newRawRefreshToken);
        const newExpiresAt = this.calculateRefreshExpiry();
        const rotationResult = await session_repository_1.sessionRepository.rotateSessionAtomic(oldTokenHash, newTokenHash, newExpiresAt);
        if (!rotationResult) {
            throw app_error_1.AppError.unauthorized('Invalid or expired refresh token');
        }
        const user = await user_repository_1.userRepository.findById(rotationResult.newSession.userId);
        if (!user || user.status !== 'ACTIVE') {
            throw app_error_1.AppError.unauthorized('Authentication failed');
        }
        const accessToken = (0, jwt_1.signAccessToken)({ id: user.id, email: user.email, username: user.username });
        return {
            user: this.mapUserToDTO(user),
            tokens: {
                accessToken,
                refreshToken: newRawRefreshToken,
            },
        };
    }
    async logout(refreshToken) {
        if (!refreshToken)
            return;
        const tokenHash = (0, jwt_1.hashRefreshToken)(refreshToken);
        await session_repository_1.sessionRepository.revokeByTokenHash(tokenHash);
    }
    async getCurrentUser(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user || user.status !== 'ACTIVE') {
            throw app_error_1.AppError.unauthorized('User account unavailable');
        }
        return this.mapUserToDTO(user);
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map