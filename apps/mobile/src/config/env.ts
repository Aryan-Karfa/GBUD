import { validateApiUrl } from '@gbud/api-client';

const rawApiUrl =
  (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) ||
  'http://localhost:4000';

export const env = {
  apiUrl: validateApiUrl(rawApiUrl, true),
};
