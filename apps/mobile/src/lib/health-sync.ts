import { Platform } from 'react-native';
import { syncWearables, type WearableEntry } from './api';

export type HealthSyncResult = { synced: number; provider: 'apple_health' | 'health_connect' };

interface SamplePoint { value: number; startDate: string | Date; endDate?: string | Date }

const sevenDaysAgo = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') return requestHealthKit();
  if (Platform.OS === 'android') return requestHealthConnect();
  return false;
}

export async function syncRecent7Days(): Promise<HealthSyncResult> {
  if (Platform.OS === 'ios') return syncFromHealthKit();
  if (Platform.OS === 'android') return syncFromHealthConnect();
  return { synced: 0, provider: 'apple_health' };
}

async function requestHealthKit(): Promise<boolean> {
  const HealthKit = loadHealthKit();
  if (!HealthKit) return false;
  try {
    const ok = await HealthKit.requestAuthorization(
      [
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierRestingHeartRate',
        'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
        'HKQuantityTypeIdentifierStepCount',
        'HKCategoryTypeIdentifierSleepAnalysis',
      ],
      [],
    );
    return Boolean(ok);
  } catch {
    return false;
  }
}

async function requestHealthConnect(): Promise<boolean> {
  const HC = loadHealthConnect();
  if (!HC) return false;
  try {
    await HC.initialize();
    const granted = await HC.requestPermission([
      { accessType: 'read', recordType: 'HeartRate' },
      { accessType: 'read', recordType: 'RestingHeartRate' },
      { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'SleepSession' },
    ]);
    return Array.isArray(granted) && granted.length > 0;
  } catch {
    return false;
  }
}

function loadHealthKit(): any | null {
  try {
    return require('@kingstinct/react-native-healthkit');
  } catch {
    return null;
  }
}

function loadHealthConnect(): any | null {
  try {
    return require('react-native-health-connect');
  } catch {
    return null;
  }
}

async function syncFromHealthKit(): Promise<HealthSyncResult> {
  const HealthKit = loadHealthKit();
  if (!HealthKit) return { synced: 0, provider: 'apple_health' };
  const since = sevenDaysAgo();
  const entries: WearableEntry[] = [];
  await Promise.all([
    pushSamples(entries, () => HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierHeartRate', { from: since }), 'heart_rate', 'bpm'),
    pushSamples(entries, () => HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', { from: since }), 'resting_hr', 'bpm'),
    pushSamples(entries, () => HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierHeartRateVariabilitySDNN', { from: since }), 'hrv', 'ms'),
    pushSamples(entries, () => HealthKit.queryQuantitySamples('HKQuantityTypeIdentifierStepCount', { from: since }), 'steps', 'count'),
    pushSleep(entries, () => HealthKit.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', { from: since })),
  ]);
  if (!entries.length) return { synced: 0, provider: 'apple_health' };
  const res = await syncWearables('apple_health', entries);
  return { synced: res.synced, provider: 'apple_health' };
}

async function syncFromHealthConnect(): Promise<HealthSyncResult> {
  const HC = loadHealthConnect();
  if (!HC) return { synced: 0, provider: 'health_connect' };
  await HC.initialize();
  const range = { operator: 'between', startTime: sevenDaysAgo().toISOString(), endTime: new Date().toISOString() };
  const entries: WearableEntry[] = [];
  await Promise.all([
    pushHCSamples(entries, () => HC.readRecords('HeartRate', { timeRangeFilter: range }), 'heart_rate', 'bpm', (r: any) => r.beatsPerMinute),
    pushHCSamples(entries, () => HC.readRecords('RestingHeartRate', { timeRangeFilter: range }), 'resting_hr', 'bpm', (r: any) => r.beatsPerMinute),
    pushHCSamples(entries, () => HC.readRecords('HeartRateVariabilityRmssd', { timeRangeFilter: range }), 'hrv', 'ms', (r: any) => r.heartRateVariabilityMillis),
    pushHCSamples(entries, () => HC.readRecords('Steps', { timeRangeFilter: range }), 'steps', 'count', (r: any) => r.count),
    pushHCSleep(entries, () => HC.readRecords('SleepSession', { timeRangeFilter: range })),
  ]);
  if (!entries.length) return { synced: 0, provider: 'health_connect' };
  const res = await syncWearables('health_connect', entries);
  return { synced: res.synced, provider: 'health_connect' };
}

async function pushSamples(
  out: WearableEntry[],
  fetcher: () => Promise<SamplePoint[] | { samples?: SamplePoint[] }>,
  dataType: WearableEntry['dataType'],
  unit: string,
): Promise<void> {
  try {
    const raw = await fetcher();
    const samples = Array.isArray(raw) ? raw : raw.samples ?? [];
    for (const s of samples) {
      out.push({ dataType, value: s.value, unit, timestamp: new Date(s.startDate).toISOString() });
    }
  } catch {
    // Silently skip — unsupported permission or empty dataset.
  }
}

async function pushSleep(
  out: WearableEntry[],
  fetcher: () => Promise<Array<{ startDate: string | Date; endDate: string | Date }>>,
): Promise<void> {
  try {
    const samples = await fetcher();
    for (const s of samples) {
      const ms = new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
      const hours = ms / 3_600_000;
      if (hours > 0.1) {
        out.push({ dataType: 'sleep', value: Number(hours.toFixed(2)), unit: 'h', timestamp: new Date(s.endDate).toISOString() });
      }
    }
  } catch {
    // Silently skip.
  }
}

async function pushHCSamples(
  out: WearableEntry[],
  fetcher: () => Promise<{ records: any[] }>,
  dataType: WearableEntry['dataType'],
  unit: string,
  extract: (r: any) => number,
): Promise<void> {
  try {
    const { records } = await fetcher();
    for (const r of records) {
      const value = extract(r);
      if (typeof value === 'number') {
        out.push({ dataType, value, unit, timestamp: r.time || r.startTime });
      }
    }
  } catch {
    // Silently skip.
  }
}

async function pushHCSleep(
  out: WearableEntry[],
  fetcher: () => Promise<{ records: Array<{ startTime: string; endTime: string }> }>,
): Promise<void> {
  try {
    const { records } = await fetcher();
    for (const r of records) {
      const ms = new Date(r.endTime).getTime() - new Date(r.startTime).getTime();
      const hours = ms / 3_600_000;
      if (hours > 0.1) {
        out.push({ dataType: 'sleep', value: Number(hours.toFixed(2)), unit: 'h', timestamp: r.endTime });
      }
    }
  } catch {
    // Silently skip.
  }
}
