import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * CacheService — Redis-backed read-through cache.
 *
 * Usage:
 *   const data = await this.cache.getOrSet(
 *     `user:${userId}`,
 *     3600,
 *     () => this.prisma.user.findUnique({ where: { id: userId } }),
 *   );
 *
 * On Redis failure, methods degrade gracefully to direct fetch (no cache).
 * TTL is in seconds.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private ready = false;

  async onModuleInit() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('REDIS_URL not set — cache disabled, falling through to DB');
      return;
    }
    try {
      this.client = new Redis(url, {
        maxRetriesPerRequest: 2,
        lazyConnect: true,
        enableOfflineQueue: false,
        connectTimeout: 5000,
      });
      this.client.on('error', (err) => {
        if (this.ready) this.logger.warn(`Redis error: ${err.message}`);
        this.ready = false;
      });
      this.client.on('ready', () => {
        this.ready = true;
        this.logger.log('Redis cache connected');
      });
      await this.client.connect();
    } catch (e: any) {
      this.logger.error(`Redis init failed: ${e.message}`);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Get-or-set pattern. If key exists in cache, return cached value.
   * Otherwise call fetcher, cache the result with given TTL, return.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    if (!this.client || !this.ready) return fetcher();
    try {
      const cached = await this.client.get(key);
      if (cached !== null) {
        try {
          return JSON.parse(cached) as T;
        } catch {
          // Corrupted value — delete and re-fetch
          await this.client.del(key);
        }
      }
    } catch (e: any) {
      this.logger.warn(`Cache GET ${key} failed: ${e.message}`);
      return fetcher();
    }

    const fresh = await fetcher();
    // Fire-and-forget set
    this.set(key, fresh, ttlSeconds).catch((e) =>
      this.logger.warn(`Cache SET ${key} failed: ${e.message}`),
    );
    return fresh;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.ready) return null;
    try {
      const v = await this.client.get(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.client || !this.ready) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (e: any) {
      this.logger.warn(`Cache SET ${key} failed: ${e.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.ready) return;
    try {
      await this.client.del(key);
    } catch {
      // ignore
    }
  }

  /**
   * Invalidate all keys matching a pattern (e.g. `user:abc:*`).
   * Uses SCAN to avoid blocking Redis with KEYS on large datasets.
   */
  async invalidate(pattern: string): Promise<number> {
    if (!this.client || !this.ready) return 0;
    try {
      let cursor = '0';
      let total = 0;
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length) {
          await this.client.del(...keys);
          total += keys.length;
        }
      } while (cursor !== '0');
      return total;
    } catch (e: any) {
      this.logger.warn(`Cache invalidate ${pattern} failed: ${e.message}`);
      return 0;
    }
  }

  /**
   * Acquire a distributed lock via Redis SET NX.
   * Returns true if this task won the lock, false if another task holds it.
   * On Redis failure returns false (skip, don't block).
   */
  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client || !this.ready) return false;
    try {
      const result = await this.client.set(`lock:${key}`, '1', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      return false;
    }
  }

  /** Release a distributed lock. Silently ignores errors. */
  async releaseLock(key: string): Promise<void> {
    if (!this.client || !this.ready) return;
    try {
      await this.client.del(`lock:${key}`);
    } catch {
      // ignore
    }
  }

  /** Basic health info for /health endpoint or metrics. */
  async stats(): Promise<{ connected: boolean; hits?: number; misses?: number }> {
    return { connected: this.ready };
  }
}
