import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { ApiError } from '@gbud/api-client';
import { LoginInput, RegisterInput } from '@gbud/validation';
import { authService } from './auth.service';
import { AuthStatus, AuthUser, MobileAuthContextType } from './auth.types';

const AuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('BOOTSTRAPPING');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const clearError = useCallback(() => {
    setError(null);
    setRequestId(null);
  }, []);

  const restoreSession = useCallback(async () => {
    setStatus('BOOTSTRAPPING');
    clearError();
    try {
      const restoredUser = await authService.restoreSession();
      if (restoredUser) {
        setUser(restoredUser);
        setStatus('AUTHENTICATED');
      } else {
        setUser(null);
        setStatus('UNAUTHENTICATED');
      }
    } catch {
      setUser(null);
      setStatus('UNAUTHENTICATED');
    }
  }, [clearError]);

  const login = useCallback(
    async (input: LoginInput) => {
      setIsLoading(true);
      clearError();
      try {
        const authenticatedUser = await authService.login(input);
        setUser(authenticatedUser);
        setStatus('AUTHENTICATED');
      } catch (err) {
        setUser(null);
        setStatus('UNAUTHENTICATED');
        if (err instanceof ApiError) {
          setError(err.message);
          setRequestId(err.requestId);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Login failed. Please try again.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      setIsLoading(true);
      clearError();
      try {
        const registeredUser = await authService.register(input);
        setUser(registeredUser);
        setStatus('AUTHENTICATED');
      } catch (err) {
        setUser(null);
        setStatus('UNAUTHENTICATED');
        if (err instanceof ApiError) {
          setError(err.message);
          setRequestId(err.requestId);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Registration failed. Please try again.');
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setStatus('UNAUTHENTICATED');
      setIsLoading(false);
    }
  }, [clearError]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        error,
        requestId,
        isLoading,
        login,
        register,
        logout,
        restoreSession,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): MobileAuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
