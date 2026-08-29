import { TokenProvider } from '../auth/auth-types';
import { RequestCredentialsMode } from '../client/request';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  tokenProvider?: TokenProvider;
  refreshHandler?: () => Promise<string | null>;
  credentials?: RequestCredentialsMode;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  onUnauthorized?: () => void | Promise<void>;
}

export const DEFAULT_TIMEOUT_MS = 10000;
export const DEFAULT_HEALTH_TIMEOUT_MS = 5000;

export function validateApiUrl(url?: string, allowHttpInDev: boolean = true): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    throw new Error('API base URL is required and cannot be empty.');
  }

  const trimmed = url.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid API URL format: "${trimmed}".`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid protocol in API URL: "${parsed.protocol}". Must be http: or https:.`);
  }

  if (!allowHttpInDev && parsed.protocol === 'http:') {
    throw new Error(`Insecure HTTP protocol is not permitted in production: "${trimmed}". Use HTTPS.`);
  }

  // Remove trailing slash for consistent route concatenation
  return trimmed.replace(/\/+$/, '');
}
