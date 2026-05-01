'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Sparkline, SectionHeader, Button, Tag, Metric } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getMyStats,
  getInsights,
  getMyGymSessions,
  getMyWeeklyVolume,
  getPersonalRecords,
  downloadExport,
  type StatsData,
  type Insights,
  type GymSessionData,
  type WeeklyVolumeEntry,
} from '@/lib/api';

type PersonalRecord = {
  exerciseId: string; exerciseName: string; bestWeight: number;
  bestReps: number; delta: number | null; achievedAt: string;
};

export default function ProgressPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [sessions, setSessions] = useState<GymSessionData[]>([]);
  const [volume, setVolume] = useState<WeeklyVolumeEntry[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);

  useEffect(() => { document.title = 'FitAI — Progress'; }, []);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getMyGymSessions().then(setSessions).catch(console.error);
    getMyWeeklyVolume().then(setVolume).catch(console.error);
    getPersonalRecords().then((d) => setRecords(d as unknown as PersonalRecord[])).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="v3-eyebrow" style={{ opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '40px 56px' }}>
      <ProgressHeader />
      <StatStrip stats={stats} sessions={sessions} volume={volume} />
      <BodyPhotos />
      <PersonalRecordsGrid records={records} />

      {/* Recovery */}
      {insights?.recovery && (
        <Card padding={24} style={{ marginBottom: 24 }}>
          <SectionHeader eyebrow="Recovery" title={insights.recovery.overallStatus} />
          <div className="v3-body" style={{ color: 'var(--text-2)' }}>{insights.recovery.recommendation}</div>
        </Card>
      )}

      {/* Export */}
      {sessions.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={() => downloadExport('export/workouts?format=csv', `fitai-workouts-${new Date().toISOString().slice(0, 10)}.csv`).catch(console.error)}>
            <FitIcon name="chart" size={14} /><span>Export CSV</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function ProgressHeader() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="v3-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>Progress</div>
      <h1 className="v3-display-2" style={{ margin: 0 }}>
        12 weeks of <span className="v3-clay" style={{ fontWeight: 300 }}>becoming.</span>
      </h1>
    </div>
  );
}

function StatStrip({ stats, sessions, volume }: { stats: StatsData; sessions: GymSessionData[]; volume: WeeklyVolumeEntry[] }) {
  const totalVol = volume.reduce((s, v) => s + (v.volumeKg || 0), 0);
  const sparkSessions = sessions.slice(-12).map((_, i) => sessions.filter((s2) => {
    const age = Date.now() - new Date(s2.startedAt).getTime();
    const week = Math.floor(age / (7 * 86_400_000));
    return week === i;
  }).length);

  const items = [
    { label: 'Total volume', value: totalVol > 1000 ? `${Math.round(totalVol / 1000)}k` : String(totalVol), unit: 'kg', delta: '', spark: [] },
    { label: 'Sessions', value: String(stats.totalSessions), unit: 'completed', delta: `${stats.currentStreak}d streak`, spark: sparkSessions.length > 1 ? sparkSessions : [] },
    { label: 'Time', value: String(Math.floor((stats.totalMinutes || 0) / 60)), unit: 'hrs', delta: '', spark: [] },
    { label: 'XP', value: stats.totalXP.toLocaleString(), unit: '', delta: '', spark: [] },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
      {items.map((m) => (
        <Card key={m.label} padding={20}>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{m.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span className="v3-numeric" style={{ fontSize: 32, color: 'var(--text-1)' }}>{m.value}</span>
            {m.unit && <span className="v3-caption">{m.unit}</span>}
          </div>
          {m.delta && <div style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600, marginBottom: 12 }}>{m.delta}</div>}
          {m.spark.length > 1 && <Sparkline data={m.spark} width={200} height={40} color="var(--sage)" />}
        </Card>
      ))}
    </div>
  );
}

function BodyPhotos() {
  const placeholders = [
    { date: 'Wk 1' }, { date: 'Wk 3' }, { date: 'Wk 5' },
    { date: 'Wk 8' }, { date: 'Wk 10' }, { date: 'Wk 12', current: true },
  ];

  return (
    <Card padding={28} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Body photos · last 12 weeks</div>
          <div className="v3-title">You can see the work.</div>
        </div>
        <Link href="/progres-fotky">
          <Button variant="ghost">+ Add photo</Button>
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {placeholders.map((p, i) => (
          <div key={i} style={{
            position: 'relative', aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden',
            background: 'var(--bg-3)',
            border: p.current ? '2px solid var(--accent)' : '1px solid var(--stroke-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FitIcon name="camera" size={20} color="var(--text-3)" />
            <div style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.7)', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-1)' }}>{p.date}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PersonalRecordsGrid({ records }: { records: PersonalRecord[] }) {
  const display = records.slice(0, 6);
  if (display.length === 0) return null;

  return (
    <Card padding={28} style={{ marginBottom: 24 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Personal records</div>
      <div className="v3-title" style={{ marginBottom: 20 }}>Your strongest, fastest, longest.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {display.map((r) => (
          <div key={r.exerciseId} style={{ padding: 18, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--stroke-1)' }}>
            <div className="v3-caption" style={{ marginBottom: 6 }}>{r.exerciseName}</div>
            <div className="v3-numeric" style={{ fontSize: 28, color: 'var(--text-1)', marginBottom: 4 }}>{r.bestWeight} kg</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span className="v3-caption">{new Date(r.achievedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              {r.delta !== null && <span style={{ color: 'var(--sage)', fontWeight: 600 }}>{r.delta > 0 ? '+' : ''}{r.delta} kg</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
