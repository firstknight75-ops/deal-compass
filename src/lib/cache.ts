/**
 * Production Caching Service
 * Simple in-memory LRU-style cache.
 * Production: swap implementation for Redis / Upstash via interface.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface Cache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds?: number): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

class InMemoryCache implements Cache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTTL = 60; // 60 seconds

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = this.defaultTTL): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // For observability
  size(): number {
    return this.store.size;
  }
}

export const cache: Cache = new InMemoryCache();

// Helper for cache-aside pattern
export async function getOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) return cached;

  const value = await fetcher();
  cache.set(key, value, ttlSeconds);
  return value;
}
