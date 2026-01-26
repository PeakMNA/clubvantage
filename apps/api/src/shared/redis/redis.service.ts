import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly keyPrefix: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('redis.url');
    this.keyPrefix = this.configService.get<string>('redis.keyPrefix') || 'clubvantage:';

    if (url) {
      this.client = new Redis(url);
    } else {
      this.client = new Redis({
        host: this.configService.get('redis.host'),
        port: this.configService.get('redis.port'),
        password: this.configService.get('redis.password'),
        db: this.configService.get('redis.db'),
      });
    }

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(this.prefixKey(key));
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setex(this.prefixKey(key), ttlSeconds, stringValue);
    } else {
      await this.client.set(this.prefixKey(key), stringValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(this.prefixKey(key));
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(this.prefixKey(key));
    return result === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(this.prefixKey(key), ttlSeconds);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(this.prefixKey(key));
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(this.prefixKey(key));
  }

  /**
   * Distributed lock for booking conflict prevention
   */
  async acquireLock(
    lockKey: string,
    ttlSeconds: number = 30,
  ): Promise<boolean> {
    const result = await this.client.set(
      this.prefixKey(`lock:${lockKey}`),
      '1',
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    await this.client.del(this.prefixKey(`lock:${lockKey}`));
  }

  /**
   * Rate limiting helper
   */
  async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const fullKey = this.prefixKey(`ratelimit:${key}`);
    const current = await this.client.incr(fullKey);

    if (current === 1) {
      await this.client.expire(fullKey, windowSeconds);
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  }

  /**
   * Cache-aside pattern helper
   */
  async cacheAside<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Get the raw Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }
}
