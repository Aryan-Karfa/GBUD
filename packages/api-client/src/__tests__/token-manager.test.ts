import { describe, it, expect, vi } from 'vitest';
import { InMemoryTokenProvider, TokenManager } from '../auth/token-manager';
import { TokenProvider } from '../auth/auth-types';

describe('TokenManager & InMemoryTokenProvider', () => {
  it('should store and retrieve tokens with InMemoryTokenProvider', async () => {
    const provider = new InMemoryTokenProvider();
    expect(await provider.getAccessToken()).toBeNull();
    expect(await provider.getRefreshToken()).toBeNull();

    await provider.setAccessToken('access-123');
    await provider.setRefreshToken('refresh-456');

    expect(await provider.getAccessToken()).toBe('access-123');
    expect(await provider.getRefreshToken()).toBe('refresh-456');

    await provider.clear();
    expect(await provider.getAccessToken()).toBeNull();
    expect(await provider.getRefreshToken()).toBeNull();
  });

  it('should delegate to custom TokenProvider in TokenManager', async () => {
    let mockStorage: Record<string, string | null> = { access: null, refresh: null };

    const customProvider: TokenProvider = {
      getAccessToken: vi.fn(async () => mockStorage.access),
      setAccessToken: vi.fn(async (t) => {
        mockStorage.access = t;
      }),
      getRefreshToken: vi.fn(async () => mockStorage.refresh),
      setRefreshToken: vi.fn(async (t) => {
        mockStorage.refresh = t;
      }),
      clear: vi.fn(async () => {
        mockStorage = { access: null, refresh: null };
      }),
    };

    const manager = new TokenManager(customProvider);

    await manager.setAccessToken('custom-access');
    expect(customProvider.setAccessToken).toHaveBeenCalledWith('custom-access');

    const token = await manager.getAccessToken();
    expect(token).toBe('custom-access');
    expect(customProvider.getAccessToken).toHaveBeenCalled();

    await manager.clear();
    expect(customProvider.clear).toHaveBeenCalled();
    expect(await manager.getAccessToken()).toBeNull();
  });

  it('should coalesce multiple concurrent refresh calls into a single execution', async () => {
    const manager = new TokenManager();
    const refreshSpy = vi.fn(async () => {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 20));
      return 'new-access-token-123';
    });

    // Fire 5 concurrent refresh executions
    const results = await Promise.all([
      manager.executeSingleFlightRefresh(refreshSpy),
      manager.executeSingleFlightRefresh(refreshSpy),
      manager.executeSingleFlightRefresh(refreshSpy),
      manager.executeSingleFlightRefresh(refreshSpy),
      manager.executeSingleFlightRefresh(refreshSpy),
    ]);

    // All 5 callers get the exact same new token
    expect(results).toEqual([
      'new-access-token-123',
      'new-access-token-123',
      'new-access-token-123',
      'new-access-token-123',
      'new-access-token-123',
    ]);

    // But the underlying refresh function was called exactly ONCE
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });
});
