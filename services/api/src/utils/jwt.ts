import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { appConfig } from '../config';
import { JWTPayload } from '@gbud/types';

export function signAccessToken(payload: { id: string; email: string; username: string }): string {
  const jwtPayload: JWTPayload = {
    sub: payload.id,
    email: payload.email,
    username: payload.username,
  };

  return jwt.sign(jwtPayload, appConfig.jwt.accessSecret, {
    expiresIn: appConfig.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, appConfig.jwt.accessSecret) as JWTPayload;
  } catch (_error) {
    throw new Error('Invalid or expired access token');
  }
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
