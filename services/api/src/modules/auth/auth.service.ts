import { RegisterInput, LoginInput } from '@gbud/validation';
import { AuthResponseData, UserDTO } from '@gbud/types';
import { userRepository } from '../../repositories/user.repository';
import { sessionRepository } from '../../repositories/session.repository';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAccessToken, generateRefreshToken, hashRefreshToken } from '../../utils/jwt';
import { AppError } from '../../utils/app-error';
import { prisma } from '../../config/prisma';

export class AuthService {
  private calculateRefreshExpiry(): Date {
    const days = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private mapUserToDTO(user: { id: string; email: string; username: string; status: string; createdAt: Date; updatedAt: Date }): UserDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status as 'ACTIVE' | 'SUSPENDED',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  public async register(input: RegisterInput): Promise<AuthResponseData> {
    const existingEmail = await userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw AppError.conflict('Email already registered');
    }

    const existingUsername = await userRepository.findByUsername(input.username);
    if (existingUsername) {
      throw AppError.conflict('Username already taken');
    }

    const passwordHash = await hashPassword(input.password);
    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = this.calculateRefreshExpiry();

    const { user } = await prisma.$transaction(async (tx) => {
      const createdUser = await userRepository.create(
        {
          email: input.email,
          username: input.username,
          passwordHash,
        },
        tx
      );

      await sessionRepository.create(
        {
          userId: createdUser.id,
          tokenHash,
          expiresAt,
        },
        tx
      );

      return { user: createdUser };
    });

    const accessToken = signAccessToken({ id: user.id, email: user.email, username: user.username });

    return {
      user: this.mapUserToDTO(user),
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  public async login(input: LoginInput): Promise<AuthResponseData> {
    const user = await userRepository.findByEmail(input.email);
    if (!user || user.status !== 'ACTIVE') {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawRefreshToken);
    const expiresAt = this.calculateRefreshExpiry();

    await sessionRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const accessToken = signAccessToken({ id: user.id, email: user.email, username: user.username });

    return {
      user: this.mapUserToDTO(user),
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
      },
    };
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponseData> {
    const oldTokenHash = hashRefreshToken(refreshToken);
    const newRawRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRawRefreshToken);
    const newExpiresAt = this.calculateRefreshExpiry();

    const rotationResult = await sessionRepository.rotateSessionAtomic(oldTokenHash, newTokenHash, newExpiresAt);

    if (!rotationResult) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(rotationResult.newSession.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw AppError.unauthorized('Authentication failed');
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email, username: user.username });

    return {
      user: this.mapUserToDTO(user),
      tokens: {
        accessToken,
        refreshToken: newRawRefreshToken,
      },
    };
  }

  public async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashRefreshToken(refreshToken);
    await sessionRepository.revokeByTokenHash(tokenHash);
  }

  public async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user || user.status !== 'ACTIVE') {
      throw AppError.unauthorized('User account unavailable');
    }
    return this.mapUserToDTO(user);
  }
}

export const authService = new AuthService();
