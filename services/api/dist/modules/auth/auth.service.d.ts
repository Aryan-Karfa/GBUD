import { RegisterInput, LoginInput } from '@gbud/validation';
import { AuthResponseData, UserDTO } from '@gbud/types';
export declare class AuthService {
    private calculateRefreshExpiry;
    private mapUserToDTO;
    register(input: RegisterInput): Promise<AuthResponseData>;
    login(input: LoginInput): Promise<AuthResponseData>;
    refreshToken(refreshToken: string): Promise<AuthResponseData>;
    logout(refreshToken: string): Promise<void>;
    getCurrentUser(userId: string): Promise<UserDTO>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map