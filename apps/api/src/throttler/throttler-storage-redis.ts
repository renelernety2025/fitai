import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler';

/**
 * Redis-backed ThrottlerStorage implementation.
 *
 * Replaces the default in-memory store so rate-limit counters are shared
 * across all ECS tasks. Without this, each of 80 tasks has separate counters,
 * making effective limits 80× higher than intended.
 *
 * Falls back gracefully when Redis is unavailable — increments never block.
 * Uses a single Redis hash per key to track hits atomically via INCR.
 *
 * Key format: `throttle:{key}:{throttlerName}`
 */
export class ThrottlerStorageRedis implements ThrottlerStorage {
  private readonly logger = new Logger(ThrottlerStorageRedis.name);
  private client: Redis;
  private ready = false;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.logger.warn('REDIS_URL not set — throttler falling back to in-memory behaviour');
      return;
    }

    this.client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 3000,
    });

    this.client.on('ready', () => {
      this.ready = true;
      this.logger.log('ThrottlerStorageRedis connected');
    });

    this.client.on('error', (err) => {
      if (this.ready) this.logger.warn(`ThrottlerStorageRedis error: ${err.message}`);
      this.ready = false;
    });

    this.client.connect().catch((e) => {
      this.logger.error(`ThrottlerStorageRedis init failed: ${e.message}`);
    });
  }

  /**
   * Atomically increment hit counter and return current state.
   * ttl is in milliseconds (as passed by @nestjs/throttler v6).
   */
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `throttle:${throttlerName}:${key}`;
    const blockKey = `throttle:block:${throttlerName}:${key}`;
    const ttlSeconds = Math.ceil(ttl / 1000);

    if (!this.client || !this.ready) {
      return { totalHits: 1, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 };
    }

    try {
      const pipeline = this.client.pipeline();
      pipeline.incr(redisKey);
      pipeline.ttl(redisKey);
      pipeline.get(blockKey);
      const results = await pipeline.exec();

      if (!results) {
        return { totalHits: 1, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 };
      }

      const totalHits = (results[0][1] as number) ?? 1;
      const currentTtl = (results[1][1] as number) ?? -1;
      const blockTtl = results[2][1] as string | null;

      // Set expiry on first hit
      if (currentTtl < 0) {
        await this.client.expire(redisKey, ttlSeconds);
      }

      const timeToExpire = currentTtl > 0 ? currentTtl * 1000 : ttl;

      // Check if currently blocked
      if (blockTtl !== null) {
        const blockTtlMs = await this.client.pttl(blockKey);
        return {
          totalHits,
          timeToExpire,
          isBlocked: true,
          timeToBlockExpire: Math.max(0, blockTtlMs),
        };
      }

      // Block if over limit and blockDuration > 0
      if (totalHits > limit && blockDuration > 0) {
        await this.client.set(blockKey, '1', 'PX', blockDuration);
        return {
          totalHits,
          timeToExpire,
          isBlocked: true,
          timeToBlockExpire: blockDuration,
        };
      }

      return { totalHits, timeToExpire, isBlocked: false, timeToBlockExpire: 0 };
    } catch (e: any) {
      this.logger.warn(`ThrottlerStorageRedis increment failed: ${e.message}`);
      return { totalHits: 1, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 };
    }
  }
}
