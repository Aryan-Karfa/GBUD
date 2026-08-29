import { UserDTO } from '@gbud/types';

export interface TokenProvider {
  getAccessToken(): Promise<string | null> | string | null;
  setAccessToken(token: string | null): Promise<void> | void;
  getRefreshToken?(): Promise<string | null> | string | null;
  setRefreshToken?(token: string | null): Promise<void> | void;
  clear(): Promise<void> | void;
}

export type AuthSessionStatus =
  | 'unknown'
  | 'unauthenticated'
  | 'authenticating'
  | 'authenticated'
  | 'loading'
  | 'refreshing'
  | 'logging_out';

export interface AuthSessionState {
  status: AuthSessionStatus;
  user: UserDTO | null;
  error: string | null;
  requestId: string | null;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken?: string;
}
