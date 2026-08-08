import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/app-error';

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Authentication token missing or invalid'));
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return next(AppError.unauthorized('Authentication token missing'));
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (_err) {
      return next(AppError.unauthorized('Invalid or expired authentication token'));
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      return next(AppError.unauthorized('Authentication failed'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      status: user.status as 'ACTIVE' | 'SUSPENDED',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    next();
  } catch (error) {
    next(error);
  }
}
