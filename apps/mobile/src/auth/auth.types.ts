import { LoginInput, RegisterInput } from '@gbud/validation';

export type AuthStatus = 'BOOTSTRAPPING' | 'UNAUTHENTICATED' | 'AUTHENTICATED';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  status?: string;
}

export interface MobileAuthContextType {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  requestId: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}
