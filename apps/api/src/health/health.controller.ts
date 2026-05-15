import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response) {
    const checks = await Promise.allSettled([
      this.pingDb(),
      this.pingRedis(),
    ]);
    const db = checks[0].status === 'fulfilled' ? checks[0].value : false;
    const redis = checks[1].status === 'fulfilled' ? checks[1].value : false;

    // Redis is optional — only db failure flips overall status to unhealthy.
    const ok = db;
    if (!ok) res.status(HttpStatus.SERVICE_UNAVAILABLE);

    return {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        db: db ? 'ok' : 'fail',
        redis: this.cache.isConfigured() ? (redis ? 'ok' : 'fail') : 'disabled',
      },
    };
  }

  @Get('live')
  @HttpCode(200)
  live() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  private async pingDb(timeoutMs = 500): Promise<boolean> {
    try {
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs)),
      ]);
      return true;
    } catch {
      return false;
    }
  }

  private async pingRedis(): Promise<boolean> {
    if (!this.cache.isConfigured()) return true;
    return this.cache.ping();
  }
}
