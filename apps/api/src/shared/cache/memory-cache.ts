/**
 * Simple in-memory TTL cache
 * Used for caching frequently accessed data that doesn't change often
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly maxSize: number;

  /**
   * @param ttlMs Time to live in milliseconds (default: 5 minutes)
   * @param maxSize Maximum number of entries (default: 1000)
   */
  constructor(ttlMs = 5 * 60 * 1000, maxSize = 1000) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    // Evict oldest entries if at max size
    if (this.cache.size >= this.maxSize) {
      const keysToDelete: string[] = [];
      const now = Date.now();

      // First, remove expired entries
      for (const [k, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          keysToDelete.push(k);
        }
      }
      keysToDelete.forEach((k) => this.cache.delete(k));

      // If still at max, remove oldest (first inserted)
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Delete all entries matching a prefix
   * Useful for invalidating all cache entries for a specific entity
   */
  deleteByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Schedule cache - caches golf course schedules
 * Key format: `schedule:${courseId}:${dateStr}`
 */
export const scheduleCache = new MemoryCache<any>(5 * 60 * 1000); // 5 minute TTL

/**
 * Course cache - caches course information
 * Key format: `course:${courseId}`
 */
export const courseCache = new MemoryCache<any>(10 * 60 * 1000); // 10 minute TTL

/**
 * Helper to generate schedule cache key
 */
export function scheduleKey(courseId: string, date: Date | string): string {
  const dateStr = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
  return `schedule:${courseId}:${dateStr}`;
}

/**
 * Helper to generate course cache key
 */
export function courseKey(courseId: string): string {
  return `course:${courseId}`;
}

/**
 * Invalidate all schedule cache entries for a course
 * Call this when a schedule is created, updated, or deleted
 */
export function invalidateScheduleCache(courseId: string): void {
  scheduleCache.deleteByPrefix(`schedule:${courseId}`);
}

/**
 * Invalidate course cache
 * Call this when course settings are updated
 */
export function invalidateCourseCache(courseId: string): void {
  courseCache.delete(courseKey(courseId));
}
