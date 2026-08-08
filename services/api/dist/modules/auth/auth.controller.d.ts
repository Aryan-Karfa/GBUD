import { Request, Response, NextFunction } from 'express';
import { APIResponse, AuthResponseData, UserDTO } from '@gbud/types';
export declare class AuthController {
    private setRefreshCookie;
    private clearRefreshCookie;
    private extractRefreshToken;
    register: (req: Request, res: Response<APIResponse<AuthResponseData>>, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response<APIResponse<AuthResponseData>>, next: NextFunction) => Promise<void>;
    refresh: (req: Request, res: Response<APIResponse<AuthResponseData>>, next: NextFunction) => Promise<void>;
    logout: (req: Request, res: Response<APIResponse<null>>, next: NextFunction) => Promise<void>;
    me: (req: Request, res: Response<APIResponse<UserDTO>>, next: NextFunction) => Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map