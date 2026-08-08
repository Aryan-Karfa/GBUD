import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { APIResponse, AuthResponseData, UserDTO } from '@gbud/types';
import { formatTimestamp } from '@gbud/utils';
import { appConfig } from '../../config';
import { AppError } from '../../utils/app-error';

const COOKIE_NAME = 'refreshToken';

export class AuthController {
  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: appConfig.env === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: appConfig.env === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }

  private extractRefreshToken(req: Request): string | undefined {
    return req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
  }

  public register = async (
    req: Request,
    res: Response<APIResponse<AuthResponseData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      this.setRefreshCookie(res, result.tokens.refreshToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (
    req: Request,
    res: Response<APIResponse<AuthResponseData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      this.setRefreshCookie(res, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (
    req: Request,
    res: Response<APIResponse<AuthResponseData>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken = this.extractRefreshToken(req);
      if (!refreshToken) {
        return next(AppError.unauthorized('Refresh token missing'));
      }

      const result = await authService.refreshToken(refreshToken);
      this.setRefreshCookie(res, result.tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (
    req: Request,
    res: Response<APIResponse<null>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken = this.extractRefreshToken(req);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      this.clearRefreshCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
        data: null,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (
    req: Request,
    res: Response<APIResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return next(AppError.unauthorized('Authentication required'));
      }

      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Current user profile retrieved',
        data: user,
        timestamp: formatTimestamp(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
