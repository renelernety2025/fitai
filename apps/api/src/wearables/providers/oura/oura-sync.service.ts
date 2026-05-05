import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { OuraOAuthService } from './oura-oauth.service';

const API_BASE = 'https://api.ouraring.com/v2/usercollection';
const SYNC_DAYS = 7;
const FETCH_TIMEOUT_MS = 8000;
const SYNC_CONCURRENCY = 5;

interface WearableDataInsert {
  userId: string;
  provider: 'oura';
  dataType: 'sleep' | 'hrv' | 'heart_rate' | 'resting_hr' | 'steps' | 'calories';
  value: number;
  unit: string;
  timestamp: Date;
}

interface OuraSleepEntry {
  day: string;
  bedtime_end?: string;
  total_sleep_duration?: number;
  average_heart_rate?: number;
  average_hrv?: number;
  lowest_heart_rate?: number;
}

interface OuraActivityEntry {
  day: string;
  steps?: number;
  active_calories?: number;
  total_calories?: number;
}

interface OuraHeartrateEntry {
  bpm: number;
  source: string;
  timestamp: string;
}

@Injectable()
export class OuraSyncService {
  private readonly logger = new Logger(OuraSyncService.name);

  constructor(
    private prisma: PrismaService,
    private oauth: OuraOAuthService,
  ) {}

  async syncRecentData(connectionId: string): Promise<{ synced: number }> {
    await this.oauth.refreshIfNeeded(connectionId);
    const conn = await this.prisma.wearableConnection.findUnique({ where: { id: connectionId } });
    if (!conn) throw new NotFoundException('Wearable connection not found');

    const range = this.dateRange(SYNC_DAYS);
    const records: WearableDataInsert[] = [];

    await Promise.all([
      this.fetchSleep(conn.userId, conn.accessToken, range, records),
      this.fetchActivity(conn.userId, conn.accessToken, range, records),
      this.fetchHeartrate(conn.userId, conn.accessToken, range, records),
    ]);

    await this.replaceWindow(conn.userId, range.startDate, records);
    await this.prisma.wearableConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });
    return { synced: records.length };
  }

  @Cron('0 4 * * *')
  async syncAll(): Promise<{ users: number; records: number }> {
    const conns = await this.prisma.wearableConnection.findMany({ where: { provider: 'oura' } });
    if (!conns.length) return { users: 0, records: 0 };
    let total = 0;
    for (let i = 0; i < conns.length; i += SYNC_CONCURRENCY) {
      const chunk = conns.slice(i, i + SYNC_CONCURRENCY);
      const results = await Promise.allSettled(chunk.map((c) => this.syncRecentData(c.id)));
      for (let j = 0; j < results.length; j++) {
        const r = results[j];
        if (r.status === 'fulfilled') total += r.value.synced;
        else this.logger.warn(`Oura sync failed for connection ${chunk[j].id}: ${(r.reason as Error).message}`);
      }
    }
    return { users: conns.length, records: total };
  }

  private dateRange(days: number) {
    const now = new Date();
    const start = new Date(now.getTime() - days * 86400000);
    return {
      startDate: start,
      startStr: start.toISOString().slice(0, 10),
      endStr: now.toISOString().slice(0, 10),
      startIso: start.toISOString(),
      endIso: now.toISOString(),
    };
  }

  private async replaceWindow(userId: string, since: Date, records: WearableDataInsert[]): Promise<void> {
    // Atomic: delete + insert in one transaction so a failed createMany doesn't leave the user
    // with an empty wearable window (which would silently degrade Daily Brief recovery score).
    await this.prisma.$transaction([
      this.prisma.wearableData.deleteMany({
        where: { userId, provider: 'oura', timestamp: { gte: since } },
      }),
      ...(records.length ? [this.prisma.wearableData.createMany({ data: records })] : []),
    ]);
  }

  private async fetchSleep(
    userId: string,
    token: string,
    range: ReturnType<OuraSyncService['dateRange']>,
    out: WearableDataInsert[],
  ): Promise<void> {
    const data = await this.fetch<{ data: OuraSleepEntry[] }>(
      `${API_BASE}/sleep?start_date=${range.startStr}&end_date=${range.endStr}`,
      token,
    );
    for (const entry of data?.data ?? []) {
      const ts = new Date(entry.bedtime_end || entry.day);
      if (entry.total_sleep_duration) {
        out.push({ userId, provider: 'oura', dataType: 'sleep', value: entry.total_sleep_duration / 3600, unit: 'h', timestamp: ts });
      }
      if (entry.average_hrv != null) {
        out.push({ userId, provider: 'oura', dataType: 'hrv', value: entry.average_hrv, unit: 'ms', timestamp: ts });
      }
      if (entry.lowest_heart_rate != null) {
        out.push({ userId, provider: 'oura', dataType: 'resting_hr', value: entry.lowest_heart_rate, unit: 'bpm', timestamp: ts });
      }
    }
  }

  private async fetchActivity(
    userId: string,
    token: string,
    range: ReturnType<OuraSyncService['dateRange']>,
    out: WearableDataInsert[],
  ): Promise<void> {
    const data = await this.fetch<{ data: OuraActivityEntry[] }>(
      `${API_BASE}/daily_activity?start_date=${range.startStr}&end_date=${range.endStr}`,
      token,
    );
    for (const entry of data?.data ?? []) {
      const ts = new Date(entry.day);
      if (entry.steps != null) {
        out.push({ userId, provider: 'oura', dataType: 'steps', value: entry.steps, unit: 'count', timestamp: ts });
      }
      const calories = entry.active_calories ?? entry.total_calories;
      if (calories != null) {
        out.push({ userId, provider: 'oura', dataType: 'calories', value: calories, unit: 'kcal', timestamp: ts });
      }
    }
  }

  private async fetchHeartrate(
    userId: string,
    token: string,
    range: ReturnType<OuraSyncService['dateRange']>,
    out: WearableDataInsert[],
  ): Promise<void> {
    const data = await this.fetch<{ data: OuraHeartrateEntry[] }>(
      `${API_BASE}/heartrate?start_datetime=${encodeURIComponent(range.startIso)}&end_datetime=${encodeURIComponent(range.endIso)}`,
      token,
    );
    for (const entry of data?.data ?? []) {
      out.push({ userId, provider: 'oura', dataType: 'heart_rate', value: entry.bpm, unit: 'bpm', timestamp: new Date(entry.timestamp) });
    }
  }

  private async fetch<T>(url: string, token: string): Promise<T | null> {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) {
        this.logger.warn(`Oura API ${res.status} ${url}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err) {
      this.logger.warn(`Oura fetch error: ${(err as Error).message}`);
      return null;
    }
  }
}
