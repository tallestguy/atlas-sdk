interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class MemoryCache {
  private cache: Map<string, CacheItem<unknown>> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  set<T>(key: string, data: T, ttlMinutes: number): void {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
