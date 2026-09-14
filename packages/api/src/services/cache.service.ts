/**
 * Lightweight in-memory cache for frequently-read, rarely-changing data.
 * Avoids redundant DB queries for catalog endpoints (skills, hackathons, etc.)
 *
 * Usage:
 *   const skills = await cache.get('skills:all', () => db.query.skills.findMany());
 *
 * TTL defaults:
 *   - 60s for user-specific data
 *   - 300s (5min) for catalog/public data
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTtl: number;

  constructor(defaultTtlMs = 60_000) {
    this.defaultTtl = defaultTtlMs;
    // Periodic cleanup to prevent memory leaks in long-running servers
    setInterval(() => this.evictExpired(), 60_000);
  }

  async get<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    const entry = this.store.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value as T;
    }
    const value = await fetcher();
    this.set(key, value, ttlMs);
    return value;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtl),
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) {
        this.store.delete(key);
      }
    }
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }
}

// Singleton: 5 minute default TTL for catalog data
export const cache = new MemoryCache(300_000);
