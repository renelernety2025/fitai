import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

/**
 * Wraps a scheduled task so every firing leaves a CronRun audit row.
 * Lets the operator see in /admin "did the weekly digest run last Friday?"
 * without grepping CloudWatch.
 *
 * Pattern at the call site:
 *   @Cron('0 4 * * *')
 *   async dailySync() {
 *     await this.cronTracking.track('oura-daily-sync', async () => {
 *       // ... real work ...
 *     });
 *   }
 *
 * Errors are RE-THROWN so existing logger.error paths still fire and
 * Sentry still receives them — this layer only adds an audit trail.
 */
@Injectable()
export class CronTrackingService {
  private readonly logger = new Logger(CronTrackingService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /**
   * Same as `track()` but acquires + releases a Redis distributed lock first
   * (so multiple ECS tasks don't all fire the same cron). Returns `null` when
   * the lock could not be acquired (another instance is already running).
   *
   * Replaces 9 sites of duplicated acquireLock + try/finally + releaseLock
   * boilerplate across notification / email / leagues / social / oura /
   * creator-economy / history-query crons.
   */
  async trackWithLock<T>(
    name: string,
    lockKey: string,
    ttlSec: number,
    fn: () => Promise<T>,
  ): Promise<T | null> {
    const acquired = await this.cache.acquireLock(lockKey, ttlSec);
    if (!acquired) return null;
    try {
      return await this.track(name, fn);
    } finally {
      await this.cache.releaseLock(lockKey);
    }
  }

  async track<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const row = await this.prisma.cronRun.create({
      data: { name, status: 'RUNNING' },
    }).catch((e) => {
      // Never block the cron because we couldn't log it.
      this.logger.warn(`CronRun row create failed for ${name}: ${e.message}`);
      return null;
    });
    const start = Date.now();
    try {
      const result = await fn();
      const durationMs = Date.now() - start;
      if (row) {
        await this.prisma.cronRun.update({
          where: { id: row.id },
          data: { status: 'OK', finishedAt: new Date(), durationMs },
        }).catch(() => {});
      }
      this.logger.log(`${name} OK in ${durationMs}ms`);
      return result;
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorText = (err?.message || String(err)).slice(0, 2000);
      if (row) {
        await this.prisma.cronRun.update({
          where: { id: row.id },
          data: {
            status: 'FAILED',
            finishedAt: new Date(),
            durationMs,
            error: errorText,
          },
        }).catch(() => {});
      }
      this.logger.error(`${name} FAILED in ${durationMs}ms: ${errorText}`);
      throw err;
    }
  }

  // Daily 02:30 UTC — prune CronRun history beyond 30 days. Without this
  // the table grows ~17k rows/day across all crons. Keep recent enough
  // for "did it run last Friday" + month-over-month troubleshooting.
  // Self-tracked: the row this cron creates falls inside the 30d window
  // so it survives the delete in its own execution.
  @Cron('30 2 * * *')
  async pruneOldRuns() {
    await this.track('cron-run-prune', async () => {
      const cutoff = new Date(Date.now() - 30 * 86400 * 1000);
      const res = await this.prisma.cronRun.deleteMany({
        where: { startedAt: { lt: cutoff } },
      });
      if (res.count > 0) {
        this.logger.log(`Pruned ${res.count} CronRun rows older than 30 days`);
      }
      return { pruned: res.count };
    });
  }

  /** Lightweight listing for the admin dashboard. */
  async listRecent(limit = 100) {
    return this.prisma.cronRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: Math.min(limit, 500),
    });
  }

  /** Group by cron name — last 24h success/fail counts + last run timestamp. */
  async getSummary() {
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    const rows = await this.prisma.cronRun.findMany({
      where: { startedAt: { gte: since } },
      orderBy: { startedAt: 'desc' },
      select: { name: true, status: true, startedAt: true, durationMs: true },
    });
    const byName: Record<string, { ok: number; failed: number; running: number; lastRun: Date; lastStatus: string; lastDurationMs: number | null }> = {};
    for (const r of rows) {
      const slot = byName[r.name] || (byName[r.name] = {
        ok: 0, failed: 0, running: 0, lastRun: r.startedAt, lastStatus: r.status, lastDurationMs: r.durationMs ?? null,
      });
      if (r.status === 'OK') slot.ok++;
      else if (r.status === 'FAILED') slot.failed++;
      else slot.running++;
    }
    return Object.entries(byName).map(([name, stats]) => ({ name, ...stats }));
  }
}
