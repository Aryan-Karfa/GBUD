import { validateApiUrl } from '@gbud/api-client';

declare const __DEV__: boolean | undefined;

/**
 * Determines whether the client is executing in a production release environment.
 * Evaluates both React Native / Metro global __DEV__ flag and process.env.NODE_ENV.
 */
export function isProductionEnv(): boolean {
  if (typeof __DEV__ !== 'undefined') {
    return !__DEV__;
  }
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return true;
  }
  return false;
}

/**
 * Resolves and validates the mobile API base URL.
 * In development: allows HTTP (e.g. localhost, 10.0.2.2 emulator, LAN IP).
 * In production: strictly enforces HTTPS and rejects insecure HTTP protocols.
 */
export function resolveApiUrl(rawUrl?: string, isProd: boolean = isProductionEnv()): string {
  const allowHttpInDev = !isProd;
  const urlToValidate = rawUrl || (!isProd ? 'http://localhost:4000' : '');

  return validateApiUrl(urlToValidate, allowHttpInDev);
}

const rawApiUrl =
  typeof process !== 'undefined' && process.env ? process.env.EXPO_PUBLIC_API_URL : undefined;

export const env = {
  apiUrl: resolveApiUrl(rawApiUrl),
  isProduction: isProductionEnv(),
};
