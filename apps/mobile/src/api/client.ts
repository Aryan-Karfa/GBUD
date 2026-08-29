import { createApiClient } from '@gbud/api-client';
import { env } from '../config/env';
import { mobileTokenProvider } from '../storage/SecureTokenProvider';

export const apiClient = createApiClient({
  baseUrl: env.apiUrl,
  tokenProvider: mobileTokenProvider,
});

export { mobileTokenProvider };
